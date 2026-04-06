import { BaseElement } from "@core/base-element.js";
import { NavigationOrchestrator } from "@core/navigation-orchestrator.js";
import { RouteSync } from "@core/route-sync.js";
import { html, type TemplateResult } from "lit-html";
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
      const container = this._renderRoot.querySelector(".app-container");
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

  private _getStyles(): TemplateResult {
    return html`
      <style>
        :host {
          display: block;
        }

        .app-container {
          position: relative;
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .zone {
          height: 100%;
          overflow: hidden;
          transition:
            width 300ms ease,
            min-width 300ms ease,
            max-width 300ms ease,
            opacity 300ms ease,
            visibility 300ms ease;
        }

        /* Mobile: One zone visible at a time, controlled by SpatialLayout */
        .layout-mobile .zone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .layout-mobile .zone[data-collapsed="true"] {
          visibility: hidden;
          pointer-events: none;
        }

        .layout-mobile .zone[data-active="true"] {
          z-index: 1;
          visibility: visible;
        }

        /* Tablet: One zone visible at a time, controlled by SpatialLayout */
        .layout-tablet .zone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .layout-tablet .zone[data-collapsed="true"] {
          visibility: hidden;
          pointer-events: none;
        }

        .layout-tablet .zone[data-active="true"] {
          z-index: 1;
          visibility: visible;
        }

        /* Desktop: One zone visible at a time, controlled by SpatialLayout */
        .layout-desktop .zone {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .layout-desktop .zone[data-collapsed="true"] {
          visibility: hidden;
          pointer-events: none;
        }

        .layout-desktop .zone[data-active="true"] {
          z-index: 1;
          visibility: visible;
        }

        /* Smooth transitions for responsive behavior */
        @media (prefers-reduced-motion: no-preference) {
          .zone {
            transition:
              width 300ms ease,
              min-width 300ms ease,
              max-width 300ms ease,
              opacity 300ms ease,
              visibility 300ms ease;
          }
        }
      </style>
    `;
  }

  private _renderContent(): TemplateResult {
    return html`
      ${this._getStyles()}
      <div part="base" class="app-container ${this._layoutClass}">
        <slot name="config"></slot>
        <slot name="home"></slot>
        <slot name="tournaments"></slot>
        <slot name="tournament"></slot>
        <slot name="matchs"></slot>
      </div>

      <slot name="command-palette"></slot>
      <slot name="gesture-overlay"></slot>
    `;
  }

  protected _render(): void {
    this._renderTemplate(this._renderContent());

    // Create zone elements in light DOM if they don't exist
    this._ensureZoneElements();
  }

  private _ensureZoneElements(): void {
    const zones = [
      { name: "config", tag: "config-zone" },
      { name: "home", tag: "home-zone" },
      { name: "tournaments", tag: "tournaments-zone" },
      { name: "tournament", tag: "tournament-zone" },
      { name: "matchs", tag: "matchs-zone" },
      { name: "command-palette", tag: "command-palette" },
      { name: "gesture-overlay", tag: "gesture-overlay" },
    ];

    for (const { name, tag } of zones) {
      if (!this.querySelector(`${tag}[slot="${name}"]`)) {
        const el = document.createElement(tag);
        el.setAttribute("slot", name);
        el.classList.add("zone");
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        el.style.width = "100%";
        el.style.height = "100%";
        this.appendChild(el);
      }
    }
  }

  private _handleResize(): void {
    const newClass = this.getLayoutClass();
    if (newClass !== this._layoutClass) {
      this._layoutClass = newClass;

      const container = this._renderRoot.querySelector(".app-container");
      if (container instanceof HTMLElement) {
        container.className = `app-container ${this._layoutClass}`;
      }
    }

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
