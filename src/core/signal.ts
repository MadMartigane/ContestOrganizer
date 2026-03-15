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
  private _value: T;
  private readonly _subscribers: Set<Subscriber<T>> = new Set();

  /**
   * Creates a new Signal instance.
   * @param initialValue - The initial value to store
   */
  constructor(initialValue: T) {
    this._value = initialValue;
  }

  /**
   * Gets the current value of the signal.
   * @returns The current value
   */
  get value(): T {
    return this._value;
  }

  /**
   * Sets a new value for the signal.
   * Notifies all subscribers if the value actually changed (using Object.is comparison).
   * @param newValue - The new value to set
   */
  set value(newValue: T) {
    if (!Object.is(this._value, newValue)) {
      this._value = newValue;
      this._notify();
    }
  }

  /**
   * Subscribes to value changes.
   * @param callback - Function called when the value changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribe(callback: Subscriber<T>): () => void {
    this._subscribers.add(callback);
    // Call immediately with current value
    callback(this._value);

    // Return unsubscribe function
    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * Removes all subscribers from this signal.
   * Useful for cleanup when the signal is no longer needed.
   */
  unsubscribeAll(): void {
    this._subscribers.clear();
  }

  /**
   * Notifies all subscribers of the current value.
   * Uses batch notification (synchronous).
   */
  private _notify(): void {
    const subscribers = Array.from(this._subscribers);
    for (const subscriber of subscribers) {
      subscriber(this._value);
    }
  }
}

/**
 * A computed signal that derives its value from other signals.
 * Automatically recomputes when any dependency changes.
 * @template T - The type of the computed value
 */
export class Computed<T> {
  private readonly _compute: () => T;
  private readonly _dependencies: ReactiveSource<unknown>[];
  private _value: T;
  private readonly _subscribers: Set<Subscriber<T>> = new Set();
  private _unsubscribers: (() => void)[] = [];

  /**
   * Creates a new Computed signal.
   * @param compute - Function that computes the derived value
   * @param dependencies - Array of signals this computation depends on
   */
  constructor(compute: () => T, dependencies: ReactiveSource<unknown>[]) {
    this._compute = compute;
    this._dependencies = dependencies;

    // Initial computation
    this._value = this._compute();

    // Subscribe to dependency changes
    this._subscribeToDependencies();
  }

  /**
   * Gets the current computed value.
   * @returns The computed value
   */
  get value(): T {
    return this._value;
  }

  /**
   * Subscribes to computed value changes.
   * @param callback - Function called when the computed value changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribe(callback: Subscriber<T>): () => void {
    this._subscribers.add(callback);
    // Call immediately with current value
    callback(this._value);

    // Return unsubscribe function
    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * Removes all subscribers from this computed signal.
   */
  unsubscribeAll(): void {
    this._subscribers.clear();
    this._unsubscribeFromDependencies();
  }

  /**
   * Subscribes to all dependency signals for changes.
   */
  private _subscribeToDependencies(): void {
    for (const dependency of this._dependencies) {
      const unsubscribe = dependency.subscribe(() => {
        this._recompute();
      });
      this._unsubscribers.push(unsubscribe);
    }
  }

  /**
   * Unsubscribes from all dependency signals.
   */
  private _unsubscribeFromDependencies(): void {
    for (const unsubscribe of this._unsubscribers) {
      unsubscribe();
    }
    this._unsubscribers = [];
  }

  /**
   * Recomputes the value and notifies subscribers if it changed.
   */
  private _recompute(): void {
    const newValue = this._compute();
    if (!Object.is(this._value, newValue)) {
      this._value = newValue;
      this._notify();
    }
  }

  /**
   * Notifies all subscribers of the current computed value.
   */
  private _notify(): void {
    const subscribers = Array.from(this._subscribers);
    for (const subscriber of subscribers) {
      subscriber(this._value);
    }
  }
}
