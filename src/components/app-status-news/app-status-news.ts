/**
 * AppStatusNews Component
 *
 * Displays project status information from TODO.md using Web Awesome
 * components with collapsible sections.
 *
 * @example
 * <app-status-news></app-status-news>
 *
 * @fires section-toggle - Emitted when a section is expanded/collapsed
 */
import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import type { StatusSection } from "@core/types/status.js";
import statusData from "@generated/status-data.json";
import { renderMarkdown as MarkdownRenderer } from "./markdown-renderer.js";

const VERSION_LABEL = "Version de l'application : ";

type ComponentState = "loading" | "ready" | "empty" | "error";

export class AppStatusNews extends BaseElement {
  /** Tracks which sections are expanded */
  private declare _expandedSections: Signal<Set<string>>;

  /** Stores event listeners for cleanup */
  private declare _boundHandlers: Array<() => void>;

  /** Current component state for rendering different UIs */
  private declare _state: ComponentState;

  /** SVG icons for each status type */
  private static readonly ICONS = {
    info: `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    bug: `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
    task: `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 14 2 2 4-4"/></svg>`,
    note: `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    warning: `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  /** Initializes component properties and signals */
  protected _setupProperties(): void {
    this._expandedSections = new Signal<Set<string>>(new Set());
    this._boundHandlers = [];
    this._initialized = true;
  }

  /**
   * Returns `this` for Light DOM usage (no shadow root)
   * @returns The element itself
   */
  protected _createRenderRoot(): this {
    return this;
  }

  /** Main render method that delegates to state-specific renders */
  protected _render(): void {
    this._state = this._determineState();

    this.innerHTML = `
      <div 
        class="flex flex-col gap-4 p-4"
        role="region"
        aria-label="Project Status"
      >
        ${this._renderContent()}
      </div>
    `;

    if (this._state === "ready") {
      this._setupEvents();
    }
  }

  /**
   * Determines the current component state based on data availability
   * @returns The appropriate component state
   */
  private _determineState(): ComponentState {
    if (!statusData?.lastUpdated) {
      return "error";
    }

    if (!statusData.sections?.length) {
      return "empty";
    }

    return "ready";
  }

  /**
   * Renders content based on current component state
   * @returns HTML string for current state
   */
  private _renderContent(): string {
    switch (this._state) {
      case "loading":
        return this._renderSkeleton();
      case "empty":
        return this._renderEmptyState();
      case "error":
        return this._renderErrorState();
      default:
        return this._renderReadyState();
    }
  }

  /**
   * Renders the skeleton loading state with shimmer effect
   * @returns HTML string for skeleton loading
   */
  private _renderSkeleton(): string {
    return `
      <div class="flex flex-col gap-4" aria-busy="true" aria-label="Loading status data">
        <div class="h-16 animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded-lg"></div>
        <div class="h-20 animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded-lg"></div>
        <div class="h-20 animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded-lg"></div>
        <div class="h-20 animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded-lg"></div>
      </div>
    `;
  }

  /**
   * Renders the empty state when no sections are available
   * @returns HTML string for empty state
   */
  private _renderEmptyState(): string {
    return `
      <div class="flex flex-col gap-4 items-center justify-center p-8 text-center text-neutral-500" role="status">
        <span aria-hidden="true">📭</span>
        <p>No status updates available</p>
      </div>
    `;
  }

  /**
   * Renders the error state when data cannot be loaded
   * @returns HTML string for error state
   */
  private _renderErrorState(): string {
    return `
      <div class="flex flex-col gap-4 items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-lg" role="alert">
        <span aria-hidden="true">⚠️</span>
        <p>Unable to load status data</p>
        <mad-button variant="danger" size="medium" class="status-retry">
          Retry
        </mad-button>
      </div>
    `;
  }

  /**
   * Renders the ready state with full status information
   * @returns HTML string for ready state
   */
  private _renderReadyState(): string {
    return `
      <!-- Version Badge (Top Center) -->
      ${this._renderVersionBadge()}
      
      <!-- Header -->
      <header class="flex flex-col gap-2">
        <h2>📋 ${statusData.projectName}</h2>
        <div class="flex gap-3 items-center text-sm text-neutral-600">
          <mad-badge variant="brand" pill>${statusData.technology}</mad-badge>
          <time class="flex gap-1 items-center text-sm text-neutral-500" datetime="${statusData.lastUpdated}">
            ${this._formatDate(statusData.lastUpdated)}
          </time>
        </div>
      </header>
      
      <!-- Sections -->
      <div 
        class="flex flex-col gap-3" 
        role="list"
        aria-live="polite"
        aria-atomic="false"
      >
        ${this._renderSections()}
      </div>
    `;
  }

  /**
   * Renders all status sections with staggered animation
   * @returns HTML string of all sections
   */
  private _renderSections(): string {
    if (!statusData.sections?.length) {
      return "";
    }

    return statusData.sections
      .map((section: StatusSection) => this._renderSection(section))
      .join("");
  }

  /**
   * Renders a single status section as a collapsible card
   * @param section - The section data to render
   * @param index - Index for stagger animation delay
   * @returns HTML string of the section
   */
  private _renderSection(section: StatusSection): string {
    const isExpanded = this._expandedSections.value.has(section.id);
    const contentId = `content-${section.id}`;
    const headerId = `header-${section.id}`;

    return `
      <mad-card appearance="outlined" data-section-id="${section.id}" role="listitem">
        <div 
          slot="header"
          class="status-card-header flex items-center justify-between gap-4 cursor-pointer" 
          id="${headerId}"
          role="button" 
          tabindex="0"
          aria-expanded="${isExpanded}"
          aria-controls="${contentId}"
        >
          ${this._renderIndicator(section.type)}
          <h3 class="status-title">${section.title}</h3>
          <span aria-hidden="true">${isExpanded ? "▼" : "▶"}</span>
        </div>
        <div 
          class="status-card-content" 
          id="${contentId}"
          role="region"
          aria-labelledby="${headerId}"
          style="display: ${isExpanded ? "block" : "none"}"
          ${isExpanded ? 'aria-hidden="false"' : 'aria-hidden="true"'}
        >
          <div class="p-4 leading-relaxed text-neutral-600">
            ${MarkdownRenderer(section.content)}
          </div>
          ${section.tables ? this._renderTables(section.tables) : ""}
        </div>
      </mad-card>
    `;
  }

  /**
   * Renders a status indicator badge with icon
   * @param type - The status type
   * @returns HTML string of the indicator
   */
  private _renderIndicator(type: StatusSection["type"]): string {
    const icon = AppStatusNews.ICONS[type] ?? AppStatusNews.ICONS.info;
    const variantMap: Record<string, string> = {
      info: "brand",
      bug: "danger",
      task: "neutral",
      note: "success",
      warning: "warning",
    };
    const variant = variantMap[type] ?? "brand";
    return `
      <mad-badge variant="${variant}" pill>
        ${icon}
        <span>${type}</span>
      </mad-badge>
    `;
  }

  /**
   * Renders markdown tables with proper styling
   * @param tables - Array of table data
   * @returns HTML string of tables
   */
  private _renderTables(tables: StatusSection["tables"]): string {
    if (!tables || tables.length === 0) {
      return "";
    }

    return `
      <div class="overflow-x-auto mt-4">
        ${tables
          .map(
            (table) => `
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr>
                ${table.headers.map((h) => `<th scope="col">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${table.rows
                .map(
                  (row) => `
                <tr>
                  ${row.map((cell) => `<td>${cell}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Sets up event listeners for card header toggles and retry button
   * @returns {void}
   */
  private _setupEvents(): void {
    const cardHeaders = Array.from(
      this.querySelectorAll(".status-card-header")
    );

    for (const header of cardHeaders) {
      const card = header.closest("mad-card");
      if (!card) {
        continue;
      }

      const sectionId = card.getAttribute("data-section-id");
      if (!sectionId) {
        continue;
      }

      // Set initial state from signal
      if (this._expandedSections.value.has(sectionId)) {
        card.setAttribute("expanded", "");
      }

      // Click handler
      const clickHandler = (): void => {
        this._toggleSection(sectionId);
      };
      header.addEventListener("click", clickHandler);
      this._boundHandlers.push(() =>
        header.removeEventListener("click", clickHandler)
      );

      // Keyboard handler for accessibility
      const keydownHandler = (event: KeyboardEvent): void => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._toggleSection(sectionId);
        }
      };
      header.addEventListener("keydown", keydownHandler);
      this._boundHandlers.push(() =>
        header.removeEventListener("keydown", keydownHandler)
      );
    }

    // Retry button handler for error state
    const retryButton = this.querySelector(".status-retry");
    if (retryButton) {
      const retryHandler = (): void => {
        this._retryLoad();
      };
      retryButton.addEventListener("click", retryHandler);
      this._boundHandlers.push(() =>
        retryButton.removeEventListener("click", retryHandler)
      );
    }
  }

  /**
   * Toggles a section's expanded state
   * @param sectionId - ID of the section to toggle
   * @returns {void}
   */
  private _toggleSection(sectionId: string): void {
    const expanded = new Set(this._expandedSections.value);

    if (expanded.has(sectionId)) {
      expanded.delete(sectionId);
    } else {
      expanded.add(sectionId);
    }

    this._expandedSections.value = expanded;
    this._updateAriaStates(sectionId);
  }

  /**
   * Updates ARIA states for a section after toggle
   * @param sectionId - ID of the section to update
   * @returns {void}
   */
  private _updateAriaStates(sectionId: string): void {
    const card = this.querySelector(`[data-section-id="${sectionId}"]`);
    if (!card) {
      return;
    }

    const header = card.querySelector(".status-card-header");
    const content = card.querySelector(".status-card-content");
    const isExpanded = this._expandedSections.value.has(sectionId);

    if (header) {
      header.setAttribute("aria-expanded", String(isExpanded));
    }

    if (content) {
      content.setAttribute("aria-hidden", String(!isExpanded));
      (content as HTMLElement).style.display = isExpanded ? "block" : "none";
    }
  }

  /**
   * Retries loading the status data
   * @returns {void}
   */
  private _retryLoad(): void {
    this._state = "loading";
    this._render();
    // In a real app, this would re-fetch data
    // For now, re-render which will show the actual state
    setTimeout(() => {
      this._render();
    }, 500);
  }

  /**
   * Formats an ISO date string into a human-readable format
   * @param isoDate - ISO 8601 formatted date string
   * @returns Formatted date string (e.g., "Mar 22, 2026 at 10:30 AM")
   */
  private _formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Renders the version badge
   * @returns HTML string of the version badge
   */
  private _renderVersionBadge(): string {
    return `
      <div class="flex justify-center mb-4" role="status" aria-label="Application version">
        <mad-badge variant="success" pill>
          <span>${VERSION_LABEL}</span>
          <span>${statusData.version}</span>
        </mad-badge>
      </div>
    `;
  }

  /** Cleans up event listeners when component is disconnected */
  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this._boundHandlers) {
      for (const handler of this._boundHandlers) {
        handler();
      }
      this._boundHandlers = [];
    }
  }
}

customElements.define("app-status-news", AppStatusNews);
