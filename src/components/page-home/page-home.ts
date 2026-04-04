import { BaseElement } from "@core/base-element.js";
import "./page-home.css";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }
  </style>
  <div part="base">
    <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
      <h1>Contest Tournament</h1>

      <div class="carousel-container">
        <img
          alt="Greek freak basketball"
          class="carousel-image"
          src="assets/img/undraw_greek_freak.svg"
        />
      </div>

      <slot name="status-news"></slot>

      <div class="footer">
        <div class="grid-300">
          <slot name="config-button"></slot>
          <slot name="tournaments-button"></slot>
        </div>
      </div>
    </div>
  </div>
`;

/**
 * PageHome - Home page component with rotating image carousel
 * @extends BaseElement
 */
export class PageHome extends BaseElement {
  private readonly imgList: Array<{ src: string; width: number }> = [
    { width: 300, src: "assets/img/undraw_greek_freak.svg" },
    { width: 300, src: "assets/img/undraw_goal.svg" },
    { width: 100, src: "assets/img/undraw_basketball.svg" },
    { width: 300, src: "assets/img/undraw_home_run.svg" },
    { width: 200, src: "assets/img/undraw_junior_soccer.svg" },
  ];

  private domImg: HTMLImageElement | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Sets up component properties (required by BaseElement)
   */
  protected _setupProperties(): void {
    // No additional properties to set up
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.intervalId = setInterval(() => {
      this.displayNextImg();
    }, 5000);
  }

  /**
   * Called when the element is removed from the DOM
   * Cleans up interval to prevent memory leaks
   */
  disconnectedCallback(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    super.disconnectedCallback();
  }

  /**
   * Displays the next random image from the list
   */
  private displayNextImg(): void {
    if (this.imgList.length === 0) {
      return;
    }
    const idx = Math.floor(Math.random() * this.imgList.length);
    const img = this.imgList[idx];
    if (this.domImg && img) {
      this.domImg.src = img.src;
      // Do NOT change width - let CSS handle sizing
    }
  }

  /**
   * Renders the component's DOM
   */
  protected _render(): void {
    const root = this._renderRoot;
    if (!root.firstChild) {
      root.appendChild(template.content.cloneNode(true));
    }

    // Query DOM for image element after render
    this.domImg = root.querySelector("img");
  }
}

customElements.define("page-home", PageHome);
