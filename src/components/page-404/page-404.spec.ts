import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./page-404.js"; // Import to register the component

describe("Page404", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should be registered as custom element", () => {
    expect(customElements.get("page-404")).toBeDefined();
  });

  it("should render 404 content when connected", () => {
    const element = document.createElement("page-404");
    document.body.appendChild(element);

    expect(element.innerHTML).toContain("404");
    expect(element.innerHTML).toContain("undraw_page_not_found");
  });

  it("should render navigation buttons", () => {
    const element = document.createElement("page-404");
    document.body.appendChild(element);

    expect(element.innerHTML).toContain("Accueil");
    expect(element.innerHTML).toContain("Tournois");
    expect(element.innerHTML).toContain("#/home");
    expect(element.innerHTML).toContain("#/tournaments");
  });
});
