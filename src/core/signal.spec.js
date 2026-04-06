import { describe, expect, it, vi } from "vitest";
import { Computed, Signal } from "./signal.js";

describe("Signal", () => {
  describe("initialization", () => {
    it("should initialize with number value", () => {
      const signal = new Signal(42);
      expect(signal.value).toBe(42);
    });
    it("should initialize with string value", () => {
      const signal = new Signal("hello");
      expect(signal.value).toBe("hello");
    });
    it("should initialize with object value", () => {
      const obj = { key: "value" };
      const signal = new Signal(obj);
      expect(signal.value).toBe(obj);
    });
    it("should initialize with array value", () => {
      const arr = [1, 2, 3];
      const signal = new Signal(arr);
      expect(signal.value).toEqual([1, 2, 3]);
    });
    it("should initialize with null value", () => {
      const signal = new Signal(null);
      expect(signal.value).toBeNull();
    });
    it("should initialize with undefined value", () => {
      const signal = new Signal(undefined);
      expect(signal.value).toBeUndefined();
    });
    it("should initialize with boolean value", () => {
      const signal = new Signal(true);
      expect(signal.value).toBe(true);
    });
  });
  describe("reading value", () => {
    it("should return current value via getter", () => {
      const signal = new Signal(100);
      expect(signal.value).toBe(100);
    });
  });
  describe("setting value", () => {
    it("should trigger subscriber when value changes", () => {
      const signal = new Signal(1);
      const callback = vi.fn();
      signal.subscribe(callback);
      // First call happens on subscribe
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(1);
      // Set new value
      signal.value = 2;
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(2);
    });
    it("should NOT trigger subscriber when setting same value", () => {
      const signal = new Signal(42);
      const callback = vi.fn();
      signal.subscribe(callback);
      // First call happens on subscribe
      expect(callback).toHaveBeenCalledTimes(1);
      // Set same value
      signal.value = 42;
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it("should handle NaN correctly using Object.is", () => {
      const signal = new Signal(Number.NaN);
      const callback = vi.fn();
      signal.subscribe(callback);
      // First call happens on subscribe
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(Number.NaN);
      // Setting NaN should not trigger (Object.is(NaN, NaN) === true)
      signal.value = Number.NaN;
      expect(callback).toHaveBeenCalledTimes(1);
    });
    it("should trigger subscriber when setting NaN after number", () => {
      const signal = new Signal(1);
      const callback = vi.fn();
      signal.subscribe(callback);
      // First call happens on subscribe
      expect(callback).toHaveBeenCalledTimes(1);
      // Setting NaN should trigger (Object.is(1, NaN) === false)
      signal.value = Number.NaN;
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(Number.NaN);
    });
  });
  describe("multiple subscribers", () => {
    it("should notify all subscribers when value changes", () => {
      const signal = new Signal(1);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      signal.subscribe(callback1);
      signal.subscribe(callback2);
      signal.subscribe(callback3);
      // Each was called once on subscribe
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
      signal.value = 2;
      // All should be called again
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);
      expect(callback3).toHaveBeenCalledTimes(2);
    });
    it("should handle many subscribers", () => {
      const signal = new Signal(0);
      const callbacks = Array.from({ length: 10 }, () => vi.fn());
      for (const cb of callbacks) {
        signal.subscribe(cb);
      }
      signal.value = 1;
      for (const cb of callbacks) {
        expect(cb).toHaveBeenCalledTimes(2);
      }
    });
  });
  describe("unsubscribe", () => {
    it("should return unsubscribe function", () => {
      const signal = new Signal(1);
      const callback = vi.fn();
      const unsubscribe = signal.subscribe(callback);
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
      signal.value = 2;
      expect(callback).toHaveBeenCalledTimes(1); // Only initial call
    });
    it("should allow multiple unsubscribes", () => {
      const signal = new Signal(1);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      signal.subscribe(callback1);
      signal.subscribe(callback2);
      signal.value = 2;
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);
      // Unsubscribe first callback only
      // Note: we can't really test "unsubscribe1()" returning another function that also unsubscribes
      // because that's not how the implementation works
      // The test below tests that multiple unsubscribe calls don't error
      const unsub = signal.subscribe(callback1);
      unsub();
      signal.value = 3;
      expect(callback1).toHaveBeenCalledTimes(3); // Called on new value
      expect(callback2).toHaveBeenCalledTimes(3); // Called on new value
      unsub(); // Calling again should not error
      signal.value = 4;
      expect(callback1).toHaveBeenCalledTimes(3); // No new call
      expect(callback2).toHaveBeenCalledTimes(4); // Called on new value
    });
    it("should unsubscribe specific callback only", () => {
      const signal = new Signal(1);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      signal.subscribe(callback1);
      const unsub2 = signal.subscribe(callback2);
      signal.value = 2;
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);
      unsub2();
      signal.value = 3;
      expect(callback1).toHaveBeenCalledTimes(3);
      expect(callback2).toHaveBeenCalledTimes(2);
    });
  });
  describe("unsubscribeAll", () => {
    it("should clear all subscribers", () => {
      const signal = new Signal(1);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      signal.subscribe(callback1);
      signal.subscribe(callback2);
      signal.unsubscribeAll();
      signal.value = 2;
      expect(callback1).toHaveBeenCalledTimes(1); // Only initial
      expect(callback2).toHaveBeenCalledTimes(1); // Only initial
    });
    it("should work when no subscribers exist", () => {
      const signal = new Signal(1);
      expect(() => signal.unsubscribeAll()).not.toThrow();
    });
  });
});
describe("Computed", () => {
  describe("initialization", () => {
    it("should compute initial value on creation", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      expect(doubled.value).toBe(10);
    });
    it("should compute with multiple dependencies", () => {
      const a = new Signal(3);
      const b = new Signal(4);
      const sum = new Computed(() => a.value + b.value, [a, b]);
      expect(sum.value).toBe(7);
    });
    it("should call subscriber immediately with initial value", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback = vi.fn();
      doubled.subscribe(callback);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(10);
    });
  });
  describe("recomputation", () => {
    it("should recompute when dependency changes", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      expect(doubled.value).toBe(10);
      count.value = 10;
      expect(doubled.value).toBe(20);
    });
    it("should recompute with multiple dependencies", () => {
      const a = new Signal(3);
      const b = new Signal(4);
      const sum = new Computed(() => a.value + b.value, [a, b]);
      expect(sum.value).toBe(7);
      a.value = 10;
      expect(sum.value).toBe(14);
      b.value = 20;
      expect(sum.value).toBe(30);
    });
    it("should notify subscribers on recomputation", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback = vi.fn();
      doubled.subscribe(callback);
      // Initial call already happened
      expect(callback).toHaveBeenCalledTimes(1);
      count.value = 10;
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(20);
      count.value = 20;
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith(40);
    });
    it("should NOT recompute when dependency value is same", () => {
      const count = new Signal(5);
      const computeFn = vi.fn(() => count.value * 2);
      const doubled = new Computed(computeFn, [count]);
      // Initial computation (called in constructor + once during dependency subscription)
      expect(computeFn).toHaveBeenCalledTimes(2);
      expect(doubled.value).toBe(10);
      // Set same value - signal does NOT notify (Object.is returns true)
      // So computed does NOT recompute
      count.value = 5;
      expect(computeFn).toHaveBeenCalledTimes(2);
      // Set a new value to trigger recomputation
      count.value = 10;
      expect(computeFn).toHaveBeenCalledTimes(3);
    });
    it("should handle NaN in computation", () => {
      const count = new Signal(Number.NaN);
      const nanCheck = new Computed(() => Number.isNaN(count.value), [count]);
      expect(nanCheck.value).toBe(true);
      count.value = 5;
      expect(nanCheck.value).toBe(false);
    });
  });
  describe("caching", () => {
    it("should return cached value without recomputation", () => {
      const count = new Signal(5);
      const computeFn = vi.fn(() => count.value * 2);
      const doubled = new Computed(computeFn, [count]);
      // First access - compute called in constructor + during dependency subscription
      expect(doubled.value).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(2);
      // Second access should use cache
      expect(doubled.value).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(2); // Still 2, no new computation
    });
    it("should only recompute when dependencies actually change", () => {
      const count = new Signal(5);
      const computeFn = vi.fn(() => count.value * 2);
      const doubled = new Computed(computeFn, [count]);
      // Access to trigger initial computation (constructor + dependency subscription)
      expect(doubled.value).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(2);
      // Set same value - signal does NOT notify, computed does NOT recompute
      count.value = 5;
      expect(doubled.value).toBe(10);
      expect(computeFn).toHaveBeenCalledTimes(2);
      // Set new value - signal notifies, computed recomputes
      count.value = 10;
      expect(doubled.value).toBe(20);
      expect(computeFn).toHaveBeenCalledTimes(3);
    });
  });
  describe("subscribers", () => {
    it("should allow multiple subscribers", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      doubled.subscribe(callback1);
      doubled.subscribe(callback2);
      count.value = 10;
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);
    });
    it("should return unsubscribe function", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback = vi.fn();
      const unsubscribe = doubled.subscribe(callback);
      count.value = 10;
      expect(callback).toHaveBeenCalledTimes(2);
      unsubscribe();
      count.value = 20;
      expect(callback).toHaveBeenCalledTimes(2); // No new calls
    });
    it("should handle unsubscribe correctly with multiple subscribers", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      doubled.subscribe(callback1);
      const unsub2 = doubled.subscribe(callback2);
      count.value = 10;
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);
      unsub2();
      count.value = 20;
      expect(callback1).toHaveBeenCalledTimes(3);
      expect(callback2).toHaveBeenCalledTimes(2); // No new calls
    });
  });
  describe("unsubscribeAll", () => {
    it("should clear all subscribers", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      doubled.subscribe(callback1);
      doubled.subscribe(callback2);
      doubled.unsubscribeAll();
      count.value = 10;
      expect(callback1).toHaveBeenCalledTimes(1); // Only initial
      expect(callback2).toHaveBeenCalledTimes(1); // Only initial
    });
    it("should unsubscribe from dependencies", () => {
      const count = new Signal(5);
      const doubled = new Computed(() => count.value * 2, [count]);
      const callback = vi.fn();
      doubled.subscribe(callback);
      doubled.unsubscribeAll();
      // Should not crash and dependencies should be unsubscribed
      count.value = 10;
      // No error expected, but computed should not recompute actively
    });
  });
  describe("complex computations", () => {
    it("should handle object return type", () => {
      const count = new Signal(3);
      const obj = new Computed(
        () => ({ value: count.value, doubled: count.value * 2 }),
        [count]
      );
      expect(obj.value).toEqual({ value: 3, doubled: 6 });
      count.value = 5;
      expect(obj.value).toEqual({ value: 5, doubled: 10 });
    });
    it("should handle array return type", () => {
      const count = new Signal(3);
      const arr = new Computed(() => [count.value, count.value * 2], [count]);
      expect(arr.value).toEqual([3, 6]);
      count.value = 5;
      expect(arr.value).toEqual([5, 10]);
    });
    it("should handle computed depending on computed", () => {
      const base = new Signal(2);
      const doubled = new Computed(() => base.value * 2, [base]);
      const quadrupled = new Computed(() => doubled.value * 2, [doubled]);
      expect(quadrupled.value).toBe(8);
      base.value = 3;
      expect(quadrupled.value).toBe(12);
    });
  });
});
