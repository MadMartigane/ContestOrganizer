import { beforeEach, describe, expect, it } from "vitest";
// Import to trigger custom element registration side-effect
import "./action-bar.js";
import type { ActionBarElement } from "./action-bar.js";

describe("ActionBarElement", () => {
  beforeEach(() => {
    // Skip registration cleanup - element is registered once via import
  });

  it("should define the custom element", () => {
    expect(customElements.get("action-bar")).toBeTruthy();
  });

  it("should create element with shadow DOM in open mode", () => {
    const element = document.createElement("action-bar");
    expect(element.shadowRoot).toBeTruthy();
  });

  it("should render with correct host styling", () => {
    const element = document.createElement("action-bar") as ActionBarElement;
    document.body.appendChild(element);

    // Verify element is in the DOM
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.innerHTML).toContain("display: flex");
    expect(element.shadowRoot?.innerHTML).toContain(
      "justify-content: flex-end"
    );

    element.remove();
  });

  it("should render slot for slotted content", () => {
    const element = document.createElement("action-bar");
    document.body.appendChild(element);

    const slot = element.shadowRoot?.querySelector("slot");
    expect(slot).toBeTruthy();

    element.remove();
  });

  it("should support custom CSS variables", () => {
    const element = document.createElement("action-bar");
    element.style.setProperty("--spacing-md", "2rem");
    element.style.setProperty("--action-bar-bg", "#f0f0f0");
    document.body.appendChild(element);

    // Verify element renders with CSS custom properties
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.innerHTML).toContain("--spacing-md");

    element.remove();
  });

  it("should support slotted content", () => {
    const element = document.createElement("action-bar");
    const button = document.createElement("button");
    button.textContent = "Test Button";
    element.appendChild(button);
    document.body.appendChild(element);

    const slotted = element.querySelector("button");
    expect(slotted).toBeTruthy();
    expect(slotted?.textContent).toBe("Test Button");

    element.remove();
  });
});
