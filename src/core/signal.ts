/**
 * Fine-grained reactive Signal system for Vanilla Web Components state management.
 * @module core/signal
 */

/**
 * Callback function type for signal subscribers.
 * @template T - The value type being observed
 */
type Subscriber<T> = (value: T) => void;

/**
 * Interface for reactive dependencies (Signal or Computed).
 */
interface ReactiveSource<T> {
  subscribe(callback: Subscriber<T>): () => void;
}

/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 * @template T - The type of value held by the signal
 */
export class Signal<T> {
  #value: T;
  readonly #subscribers: Set<Subscriber<T>> = new Set();

  /**
   * Creates a new Signal instance.
   * @param initialValue - The initial value to store
   */
  constructor(initialValue: T) {
    this.#value = initialValue;
  }

  /**
   * Gets the current value of the signal.
   * @returns The current value
   */
  get value(): T {
    return this.#value;
  }

  /**
   * Sets a new value for the signal.
   * Notifies all subscribers if the value actually changed (using Object.is comparison).
   * @param newValue - The new value to set
   */
  set value(newValue: T) {
    if (!Object.is(this.#value, newValue)) {
      this.#value = newValue;
      this.#notify();
    }
  }

  /**
   * Subscribes to value changes.
   * @param callback - Function called when the value changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribe(callback: Subscriber<T>): () => void {
    this.#subscribers.add(callback);
    // Call immediately with current value
    callback(this.#value);

    // Return unsubscribe function
    return () => {
      this.#subscribers.delete(callback);
    };
  }

  /**
   * Removes all subscribers from this signal.
   * Useful for cleanup when the signal is no longer needed.
   */
  unsubscribeAll(): void {
    this.#subscribers.clear();
  }

  /**
   * Notifies all subscribers of the current value.
   * Uses batch notification (synchronous).
   */
  #notify(): void {
    for (const subscriber of this.#subscribers) {
      subscriber(this.#value);
    }
  }
}

/**
 * A computed signal that derives its value from other signals.
 * Automatically recomputes when any dependency changes.
 * @template T - The type of the computed value
 */
export class Computed<T> {
  readonly #compute: () => T;
  readonly #dependencies: ReactiveSource<unknown>[];
  #value: T;
  readonly #subscribers: Set<Subscriber<T>> = new Set();
  #unsubscribers: (() => void)[] = [];

  /**
   * Creates a new Computed signal.
   * @param compute - Function that computes the derived value
   * @param dependencies - Array of signals this computation depends on
   */
  constructor(compute: () => T, dependencies: ReactiveSource<unknown>[]) {
    this.#compute = compute;
    this.#dependencies = dependencies;

    // Initial computation
    this.#value = this.#compute();

    // Subscribe to dependency changes
    this.#subscribeToDependencies();
  }

  /**
   * Gets the current computed value.
   * @returns The computed value
   */
  get value(): T {
    return this.#value;
  }

  /**
   * Subscribes to computed value changes.
   * @param callback - Function called when the computed value changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribe(callback: Subscriber<T>): () => void {
    this.#subscribers.add(callback);
    // Call immediately with current value
    callback(this.#value);

    // Return unsubscribe function
    return () => {
      this.#subscribers.delete(callback);
    };
  }

  /**
   * Removes all subscribers from this computed signal.
   */
  unsubscribeAll(): void {
    this.#subscribers.clear();
    this.#unsubscribeFromDependencies();
  }

  /**
   * Subscribes to all dependency signals for changes.
   */
  #subscribeToDependencies(): void {
    for (const dependency of this.#dependencies) {
      const unsubscribe = dependency.subscribe(() => {
        this.#recompute();
      });
      this.#unsubscribers.push(unsubscribe);
    }
  }

  /**
   * Unsubscribes from all dependency signals.
   */
  #unsubscribeFromDependencies(): void {
    for (const unsubscribe of this.#unsubscribers) {
      unsubscribe();
    }
    this.#unsubscribers = [];
  }

  /**
   * Recomputes the value and notifies subscribers if it changed.
   */
  #recompute(): void {
    const newValue = this.#compute();
    if (!Object.is(this.#value, newValue)) {
      this.#value = newValue;
      this.#notify();
    }
  }

  /**
   * Notifies all subscribers of the current computed value.
   */
  #notify(): void {
    for (const subscriber of this.#subscribers) {
      subscriber(this.#value);
    }
  }
}
