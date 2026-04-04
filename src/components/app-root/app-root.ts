import { BaseElement } from "@core/base-element.js";
import "./app-root.css";
import { NavigationOrchestrator } from "@core/navigation-orchestrator.js";
import { RouteSync } from "@core/route-sync.js";
import "../zones/home-zone.js";
import "../zones/config-zone.js";
import "../zones/tournaments-zone.js";
import "../zones/matchs-zone.js";
import "../zones/tournament-zone.js";

export class AppRoot extends BaseElement {
  private _layoutClass = "layout-mobile";
  private orchestrator: NavigationOrchestrator | null = null;
  private routeSync: RouteSync | null = null;

  constructor() {
    super();
    this._handleResize = this._handleResize.bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Global navigate event listener
    this.addEventListener("navigate", (e: Event) => {
      const detail = (e as CustomEvent<{ hash: string }>).detail;
      window.location.hash = detail.hash;
    });

    window.addEventListener("resize", this._handleResize);
    this._handleResize();

    // Initialize orchestrator after DOM is rendered
    queueMicrotask(() => {
      const container = this.querySelector(".app-container");
      if (container instanceof HTMLElement) {
        this.orchestrator = new NavigationOrchestrator(container);
        this.orchestrator.enable();

        // Wire RouteSync for URL ↔ orchestrator sync
        this.routeSync = new RouteSync(this.orchestrator);
        this.routeSync.enable();
      }
    });
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this._handleResize);
    this.routeSync?.disable();
    this.routeSync = null;
    this.orchestrator?.destroy();
    this.orchestrator = null;
    super.disconnectedCallback();
  }

  protected _setupProperties(): void {
    this._initialized = true;
  }

  protected _render(): void {
    this.innerHTML = `
      <div class="app-container ${this._layoutClass}">
        <config-zone class="zone config"></config-zone>
        <home-zone class="zone home"></home-zone>
        <tournaments-zone class="zone tournaments"></tournaments-zone>
        <tournament-zone class="zone tournament"></tournament-zone>
        <matchs-zone class="zone matchs"></matchs-zone>
      </div>

      <command-palette></command-palette>
      <gesture-overlay></gesture-overlay>
    `;
  }

  private _handleResize(): void {
    const newClass = this.getLayoutClass();
    if (newClass !== this._layoutClass) {
      this._layoutClass = newClass;

      // Instead of full re-render, update the container class in-place
      // to avoid destroying SpatialLayout's zone element references
      const container = this.querySelector(".app-container");
      if (container instanceof HTMLElement) {
        container.className = `app-container ${this._layoutClass}`;
      }
    }

    // Always notify orchestrator of current viewport state
    this.orchestrator?.getLayout().handleResize();
  }

  private getLayoutClass(): string {
    if (window.innerWidth >= 1024) {
      return "layout-desktop";
    }
    if (window.innerWidth >= 768) {
      return "layout-tablet";
    }
    return "layout-mobile";
  }
}

customElements.define("app-root", AppRoot);
