import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BaseElement } from "./base-element.js";
import { Signal } from "./signal.js";

class TestElement extends BaseElement {
  renderCount = 0;
  lastAttributeChange = null;
  static get observedAttributes() {
    return ["data-test", "data-id", "data-one", "data-two", "data-three"];
  }
  _setupProperties() {
    // No properties to set up for testing
    this._initialized = true;
  }
  _render() {
    this.renderCount++;
    this.innerHTML = `<div>Render ${this.renderCount}</div>`;
  }
  _onAttributeChange(name, value) {
    this.lastAttributeChange = { name, value };
  }
  // Expose protected methods for testing
  requestRender() {
    this._requestRender();
  }
  emit(eventName, detail) {
    this._emit(eventName, detail);
  }
}
/**
 * Test element without custom observedAttributes to test default behavior
 */
class TestElementDefault extends BaseElement {
  renderCount = 0;
  _setupProperties() {
    // No properties to set up for testing
    this._initialized = true;
  }
  _render() {
    this.renderCount++;
    this.innerHTML = `<div>Render ${this.renderCount}</div>`;
  }
  _onAttributeChange() {
    // No-op
  }
}
class TestElementWithSignals extends BaseElement {
  renderCount = 0;
  trackedSignal = null;
  _setupProperties() {
    // No properties to set up for testing
    this._initialized = true;
  }
  _render() {
    this.renderCount++;
    this.innerHTML = `<div>Signal: ${this.trackedSignal?.value ?? "none"}</div>`;
  }
  _onAttributeChange() {
    // No-op for testing
  }
  // Expose protected methods for testing
  trackSignal(signal) {
    return this._trackSignal(signal);
  }
}
// Register custom elements
customElements.define("test-element", TestElement);
customElements.define("test-element-signals", TestElementWithSignals);
customElements.define("test-element-default", TestElementDefault);
/**
 * Helper to flush pending microtasks
 */
function flushMicrotasks() {
  return new Promise((resolve) => queueMicrotask(() => resolve()));
}
describe("BaseElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });
  describe("connectedCallback", () => {
    it("should trigger render when element is added to DOM", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      expect(el.renderCount).toBe(1);
      expect(el.innerHTML).toContain("Render 1");
    });
    it("should set _isConnected to true when connected", () => {
      const el = new TestElement();
      expect(el.renderCount).toBe(0);
      document.body.appendChild(el);
      expect(el.renderCount).toBe(1);
    });
    it("should render again when connectedCallback is called manually", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      const initialRenderCount = el.renderCount;
      el.connectedCallback();
      expect(el.renderCount).toBe(initialRenderCount + 1);
    });
  });
  describe("disconnectedCallback", () => {
    it("should set _isConnected to false when removed from DOM", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      document.body.removeChild(el);
      expect(el.renderCount).toBe(1);
    });
    it("should clean up tracked signals on disconnect", async () => {
      const el = new TestElementWithSignals();
      const signal = new Signal("initial");
      document.body.appendChild(el);
      el.trackedSignal = el.trackSignal(signal);
      await flushMicrotasks();
      expect(el.renderCount).toBe(2);
      signal.value = "changed";
      await flushMicrotasks();
      expect(el.renderCount).toBe(3);
      document.body.removeChild(el);
      signal.value = "after disconnect";
      // Render count should not increase since disconnected
      expect(el.renderCount).toBe(3);
    });
  });
  describe("attributeChangedCallback", () => {
    it("should trigger _onAttributeChange when observed attribute changes", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.setAttribute("data-test", "value");
      await flushMicrotasks();
      expect(el.lastAttributeChange).not.toBeNull();
      expect(el.lastAttributeChange?.name).toBe("data-test");
      expect(el.lastAttributeChange?.value).toBe("value");
    });
    it("should trigger render when observed attribute changes", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      const initialRenderCount = el.renderCount;
      el.setAttribute("data-test", "value");
      await flushMicrotasks();
      expect(el.renderCount).toBe(initialRenderCount + 1);
    });
    it("should not trigger render if attribute value hasn't changed", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.setAttribute("data-test", "value1");
      await flushMicrotasks();
      const renderCountAfterFirst = el.renderCount;
      el.setAttribute("data-test", "value1");
      await flushMicrotasks();
      expect(el.renderCount).toBe(renderCountAfterFirst);
    });
    it("should handle attribute removal", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.setAttribute("data-test", "value");
      await flushMicrotasks();
      el.removeAttribute("data-test");
      await flushMicrotasks();
      expect(el.lastAttributeChange?.value).toBeNull();
    });
    it("should handle multiple attribute changes", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.setAttribute("data-one", "1");
      el.setAttribute("data-two", "2");
      el.setAttribute("data-three", "3");
      await flushMicrotasks();
      expect(el.lastAttributeChange?.name).toBe("data-three");
      expect(el.lastAttributeChange?.value).toBe("3");
      expect(el.renderCount).toBeGreaterThan(1);
    });
  });
  describe("_requestRender", () => {
    it("should batch multiple render requests into a single render", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      const initialRenderCount = el.renderCount;
      el.requestRender();
      el.requestRender();
      el.requestRender();
      await flushMicrotasks();
      // Should only render once due to batching
      expect(el.renderCount).toBe(initialRenderCount + 1);
    });
    it("should render after microtask completes", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.requestRender();
      // Render hasn't happened yet (microtask pending)
      const renderCountBefore = el.renderCount;
      return new Promise((resolve) => {
        queueMicrotask(() => {
          expect(el.renderCount).toBe(renderCountBefore + 1);
          resolve();
        });
      });
    });
    it("should not render if disconnected before microtask", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      el.requestRender();
      document.body.removeChild(el);
      return new Promise((resolve) => {
        queueMicrotask(() => {
          // Render should not have happened since disconnected
          expect(el.renderCount).toBe(1);
          resolve();
        });
      });
    });
  });
  describe("_emit", () => {
    it("should dispatch a CustomEvent with provided detail", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      const eventHandler = vi.fn();
      el.addEventListener("test-event", eventHandler);
      el.emit("test-event", { message: "hello" });
      expect(eventHandler).toHaveBeenCalledTimes(1);
      const event = eventHandler.mock.calls[0]?.[0];
      expect(event?.detail).toEqual({ message: "hello" });
    });
    it("should dispatch event with bubbles enabled", () => {
      const el = new TestElement();
      const parent = document.createElement("div");
      parent.appendChild(el);
      document.body.appendChild(parent);
      const eventHandler = vi.fn();
      parent.addEventListener("test-event", eventHandler);
      el.emit("test-event", { data: "test" });
      expect(eventHandler).toHaveBeenCalledTimes(1);
    });
    it("should dispatch event with composed enabled", () => {
      const el = new TestElement();
      document.body.appendChild(el);
      const eventHandler = vi.fn();
      el.addEventListener("test-event", eventHandler);
      el.emit("test-event", { data: "test" });
      const event = eventHandler.mock.calls[0]?.[0];
      expect(event?.composed).toBe(true);
    });
  });
  describe("_trackSignal", () => {
    it("should subscribe to signal and trigger re-render on value change", async () => {
      const el = new TestElementWithSignals();
      const signal = new Signal("initial");
      document.body.appendChild(el);
      const renderCountAfterConnect = el.renderCount;
      el.trackedSignal = el.trackSignal(signal);
      await flushMicrotasks();
      // Subscribe triggers immediate callback, so renderCount increases
      const renderCountAfterTrack = el.renderCount;
      signal.value = "changed";
      await flushMicrotasks();
      expect(el.renderCount).toBe(renderCountAfterTrack + 1);
      expect(renderCountAfterConnect).toBe(1);
    });
    it("should not re-subscribe to already tracked signal", () => {
      const el = new TestElementWithSignals();
      const signal = new Signal("initial");
      document.body.appendChild(el);
      const signalAgain = el.trackSignal(signal);
      const signalThird = el.trackSignal(signal);
      // All should return the same signal
      expect(signalAgain).toBe(signal);
      expect(signalThird).toBe(signal);
    });
    it("should clean up signal subscription on disconnect", () => {
      const el = new TestElementWithSignals();
      const signal = new Signal("initial");
      document.body.appendChild(el);
      el.trackedSignal = el.trackSignal(signal);
      document.body.removeChild(el);
      // After disconnect, signal changes should not trigger render
      const renderCountBefore = el.renderCount;
      signal.value = "after disconnect";
      expect(el.renderCount).toBe(renderCountBefore);
    });
  });
  describe("observedAttributes", () => {
    it("should return empty array by default", () => {
      expect(TestElementDefault.observedAttributes).toEqual([]);
    });
  });
  describe("lifecycle integration", () => {
    it("should handle full lifecycle: connect, update, disconnect", async () => {
      const el = new TestElement();
      document.body.appendChild(el);
      expect(el.renderCount).toBe(1);
      el.setAttribute("data-id", "123");
      await flushMicrotasks();
      expect(el.renderCount).toBe(2);
      el.setAttribute("data-id", "456");
      await flushMicrotasks();
      expect(el.renderCount).toBe(3);
      document.body.removeChild(el);
      expect(el.renderCount).toBe(3);
      // Reconnecting should render again
      document.body.appendChild(el);
      expect(el.renderCount).toBe(4);
    });
    it("should work with multiple elements independently", async () => {
      const el1 = new TestElement();
      const el2 = new TestElement();
      document.body.appendChild(el1);
      document.body.appendChild(el2);
      expect(el1.renderCount).toBe(1);
      expect(el2.renderCount).toBe(1);
      el1.setAttribute("data-test", "value");
      await flushMicrotasks();
      expect(el1.renderCount).toBe(2);
      expect(el2.renderCount).toBe(1);
      el2.setAttribute("data-test", "value");
      await flushMicrotasks();
      expect(el1.renderCount).toBe(2);
      expect(el2.renderCount).toBe(2);
    });
  });
});
