/**
 * MadTeamTile - Vanilla Web Component for displaying a team tile
 * @module components/team-tile
 */
import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { html } from "lit-html";
/**
 * MadTeamTile displays a team with logo, name, and optional rank badge.
 * Uses IntersectionObserver for lazy loading images.
 */
export class MadTeamTile extends BaseElement {
  /** Team data object */
  _team = null;
  /** Reverse layout direction */
  _reverse = null;
  /** Rank number for badge display */
  _rank;
  /** IntersectionObserver for lazy loading */
  _intersectionObserver = null;
  /** Track if image has been loaded */
  _imageLoaded = false;
  /**
   * Sets up property getters and setters.
   * Called by BaseElement constructor.
   */
  _setupProperties() {
    // Initialize signals before tracking
    this._imgSrc = new Signal("");
    this._imageError = new Signal(false);
    // Track signals for reactive rendering
    this._trackSignal(this._imgSrc);
    this._trackSignal(this._imageError);
    this._initialized = true;
  }
  /**
   * Team property getter.
   */
  get team() {
    return this._team;
  }
  /**
   * Team property setter - triggers image load when team changes.
   */
  set team(value) {
    this._team = value;
    this._imageError.value = false;
    if (value) {
      this._loadImg(value.id);
    }
    this._requestRender();
  }
  /**
   * Reverse property getter.
   */
  get reverse() {
    return this._reverse;
  }
  /**
   * Reverse property setter - controls layout direction.
   */
  set reverse(value) {
    this._reverse = value;
    this._requestRender();
  }
  /**
   * Rank property getter.
   */
  get rank() {
    return this._rank;
  }
  /**
   * Rank property setter - displays rank badge when set.
   */
  set rank(value) {
    this._rank = value;
    this._requestRender();
  }
  /**
   * Called when the element is added to the DOM.
   * Sets up IntersectionObserver for lazy loading.
   */
  connectedCallback() {
    super.connectedCallback();
    // Set up IntersectionObserver for lazy loading
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this._imageLoaded) {
          this._imageLoaded = true;
          this._loadImg(this._team?.id ?? null);
          this._intersectionObserver?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    this._intersectionObserver.observe(this);
  }
  /**
   * Called when the element is removed from the DOM.
   * Cleans up IntersectionObserver.
   */
  disconnectedCallback() {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
    super.disconnectedCallback();
  }
  /**
   * Loads the team logo image.
   * @param id - Team ID (unused, kept for API compatibility)
   */
  _loadImg(_id) {
    if (this._team?.logo) {
      // API-Sports teams have direct logo URL
      setTimeout(() => {
        this._imgSrc.value = this._team?.logo ?? "";
      });
    }
  }
  /**
   * Handles image load error.
   */
  _onImageError() {
    this._imageError.value = true;
    console.warn("[TeamTile] Image failed to load:", this._team?.logo);
  }
  /**
   * Returns the CSS for the component.
   */
  _getCss() {
    return `
      .rank-badge {
        position: absolute;
        top: -14px;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        font-weight: bold;
        color: #1a1a1a;
        text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
      .rank-badge.rank-1 {
        background: linear-gradient(to bottom, #ffd700, #b8860b);
        border: 1.5px solid #fffacd;
      }
      .rank-badge.rank-2 {
        background: linear-gradient(to bottom, #e8e8e8, #a0a0a0);
        border: 1.5px solid #ffffff;
      }
      .rank-badge.rank-3 {
        background: linear-gradient(to bottom, #cd7f32, #8b4513);
        border: 1.5px solid #fffacd;
      }
      .rank-badge.rank-other {
        background: linear-gradient(to bottom, #e0f2fe, #7dd3fc);
        border: 1.5px solid #ffffff;
      }
      .rank-badge-left {
        left: -14px;
      }
      .rank-badge-right {
        right: -14px;
      }
      .team-image-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background-color: var(--wa-color-neutral-200);
        border-radius: var(--wa-border-radius-small);
      }
      .team-image-fallback svg {
        width: 40px;
        height: 40px;
        color: var(--wa-color-neutral-400);
        animation: basketball-pulse 1.5s ease-in-out infinite;
        will-change: transform, opacity;
      }

      @keyframes basketball-pulse {
        0%, 100% {
          transform: scale(0.95);
          opacity: 0.6;
        }
        50% {
          transform: scale(1.05);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .team-image-fallback svg {
          opacity: 0.8;
          animation: none;
        }
      }
    `;
  }
  /**
   * Renders the rank badge HTML if rank is set.
   */
  _renderRankBadge() {
    const rank = this._rank;
    if (!rank) {
      return "";
    }
    const rankClass = rank <= 3 ? rank : "other";
    const positionClass = this._reverse
      ? "rank-badge-left"
      : "rank-badge-right";
    return html`<div class="rank-badge rank-${rankClass} ${positionClass}" aria-label="Rank ${rank}">${rank}</div>`;
  }
  /**
   * Renders the team name element.
   */
  _renderTeamName() {
    const team = this._team;
    return team
      ? html`<span class="text-balance">${team.name}</span>`
      : html`<span>⏳</span>`;
  }
  /**
   * Main render method.
   * Called by BaseElement when reactive state changes.
   */
  _render() {
    const reverse = this._reverse;
    const imgSrc = this._imgSrc.value;
    const imageError = this._imageError.value;
    const imageContainerClass = reverse
      ? "min-h-8 w-full md:w-1/2"
      : "min-h-8 w-full md:w-1/2";
    const nameContainerClass = reverse
      ? "float-right min-h-8 w-full md:float-none md:w-1/2"
      : "float-left min-h-8 w-full md:float-none md:w-1/2";
    const nameTextClass = reverse
      ? "float-right my-1 w-full text-right"
      : "float-left my-1 w-full text-left";
    // Compute image content
    let imageContent;
    if (imageError) {
      const iconClass = reverse
        ? "float-right text-6xl text-neutral-400"
        : "float-left text-6xl text-neutral-400";
      imageContent = html`<mad-icon
        class="${iconClass}"
        name="shield-x"
        style="width: 64px; height: 64px;"
      ></mad-icon>`;
    } else if (imgSrc) {
      const imgClass = reverse ? "float-right w-16" : "float-left w-16";
      imageContent = html`<img
        alt="${this._team?.name ?? ""} club logo"
        class="${imgClass}"
        height="64"
        src="${imgSrc}"
        width="64"
        @error=${this._onImageError.bind(this)}
      />`;
    } else {
      const fallbackClass = reverse
        ? "team-image-fallback float-right"
        : "team-image-fallback float-left";
      imageContent = html`<div class="${fallbackClass}">
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M12 2c-3 3-3 17 0 22" />
          <path d="M12 2c3 3 3 17 0 22" />
        </svg>
      </div>`;
    }
    this._renderTemplate(html`
      <style>
        ${this._getCss()}
      </style>
      <div class="relative">
        ${this._renderRankBadge()}
        <div class="w-full">
          <div class="${imageContainerClass}">
            ${imageContent}
          </div>
          <div class="${nameContainerClass}">
            <div class="${nameTextClass}">
              ${this._renderTeamName()}
            </div>
          </div>
        </div>
      </div>
    `);
  }
}
// Register the custom element
customElements.define("mad-team-tile", MadTeamTile);
