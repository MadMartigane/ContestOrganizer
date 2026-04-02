import { BaseElement } from "@core/base-element.js";

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
      this.domImg.width = img.width;
    }
  }

  /**
   * Renders the component's DOM
   */
  protected _render(): void {
    this.innerHTML = `
      <div class="page-content">
        <h1>Contest Tournament</h1>

        <div class="flex-center">
          <img
            alt="Greek freak basketball"
            class="h-64"
            height="300"
            src="assets/img/undraw_greek_freak.svg"
            width="300"
          />
        </div>

        <app-status-news></app-status-news>

        <div class="footer">
          <div class="grid-300">
            <wa-button href="#/config" size="large" variant="brand">
              <wa-icon name="gear" slot="start"></wa-icon>
              <span slot="end">Configuration</span>
            </wa-button>

            <wa-button href="#/tournaments" size="large" variant="brand">
              <wa-icon name="trophy" slot="start"></wa-icon>
              <span slot="end">Tournois</span>
            </wa-button>
          </div>
        </div>
      </div>
    `;

    // Query DOM for image element after render
    this.domImg = this.querySelector("img");
  }
}

customElements.define("page-home", PageHome);
