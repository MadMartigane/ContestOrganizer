import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./error-message.js";

describe("ErrorMessage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should be registered as custom element", () => {
    expect(customElements.get("error-message")).toBeDefined();
  });

  it("should render with message attribute", () => {
    const element = document.createElement("error-message");
    element.setAttribute("message", "Test error message");
    document.body.appendChild(element);

    expect((element as any)._renderRoot.innerHTML).toContain(
      "Test error message"
    );
    expect((element as any)._renderRoot.innerHTML).toContain("mad-callout");
  });

  it("should show home button by default", () => {
    const element = document.createElement("error-message");
    element.setAttribute("message", "Error");
    document.body.appendChild(element);

    expect((element as any)._renderRoot.innerHTML).toContain(
      "Retour à l'accueil"
    );
  });

  it("should hide home button when go-home-button is false", () => {
    const element = document.createElement("error-message");
    element.setAttribute("message", "Error");
    element.setAttribute("go-home-button", "false");
    document.body.appendChild(element);

    expect((element as any)._renderRoot.innerHTML).not.toContain(
      "Retour à l'accueil"
    );
  });

  it("should update when message attribute changes", async () => {
    const element = document.createElement("error-message");
    element.setAttribute("message", "Initial");
    document.body.appendChild(element);

    expect((element as any)._renderRoot.innerHTML).toContain("Initial");

    element.setAttribute("message", "Updated");
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect((element as any)._renderRoot.innerHTML).toContain("Updated");
  });
});
