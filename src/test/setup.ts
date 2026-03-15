import { afterEach } from "vitest";

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = "";
});

// Helper to flush microtasks
export function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

// Helper to create and mount a custom element
export function mountElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props: Record<string, unknown> = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  for (const [key, value] of Object.entries(props)) {
    element.setAttribute(key, String(value));
  }

  document.body.appendChild(element);
  return element;
}

// Helper to trigger attribute changes
export function triggerAttributeChange(
  element: Element,
  attributeName: string,
  newValue: string | null
): void {
  if (newValue !== null) {
    element.setAttribute(attributeName, newValue);
  } else {
    element.removeAttribute(attributeName);
  }
}
