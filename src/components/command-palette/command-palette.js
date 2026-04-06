import { html, nothing } from "lit-html";
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";
/**
 * Command palette component for desktop (⌘K) inspired by VS Code/Linear.
 * Provides quick access to application commands via keyboard shortcut.
 * @element command-palette
 */
export class CommandPalette extends BaseElement {
  static shortcutKey = "k";
  static modifierKeys = ["metaKey", "ctrlKey"];
  // Command registry
  _commands = [];
  // DOM references
  domInput = null;
  domCommandList = null;
  // Bound handlers for cleanup
  _boundGlobalKeydown = null;
  _setupProperties() {
    this._isOpen = new Signal(false);
    this._query = new Signal("");
    this._selectedIndex = new Signal(0);
    this._trackSignal(this._isOpen);
    this._trackSignal(this._query);
    this._trackSignal(this._selectedIndex);
    this._initialized = true;
  }
  connectedCallback() {
    super.connectedCallback();
    this._boundGlobalKeydown = this._handleGlobalKeydown.bind(this);
    document.addEventListener("keydown", this._boundGlobalKeydown);
    this._setupDefaultCommands();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._boundGlobalKeydown) {
      document.removeEventListener("keydown", this._boundGlobalKeydown);
      this._boundGlobalKeydown = null;
    }
  }
  /**
   * Handle global keyboard shortcuts
   */
  _handleGlobalKeydown(e) {
    // Open palette with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if (this._isModifierKeyPressed(e) && e.key === CommandPalette.shortcutKey) {
      e.preventDefault();
      this._toggle();
      return;
    }
    // Close on Escape when open
    if (e.key === "Escape" && this._isOpen.value) {
      e.preventDefault();
      this._close();
      return;
    }
    // Navigate list when open
    if (!this._isOpen.value) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._navigateDown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._navigateUp();
    } else if (e.key === "Enter") {
      e.preventDefault();
      this._executeSelected();
    }
  }
  /**
   * Check if modifier key is pressed (Cmd on Mac, Ctrl on Windows/Linux)
   */
  _isModifierKeyPressed(e) {
    return CommandPalette.modifierKeys.some((key) => e[key]);
  }
  /**
   * Toggle palette open/closed state
   */
  _toggle() {
    if (this._isOpen.value) {
      this._close();
    } else {
      this._open();
    }
  }
  /**
   * Open the command palette
   */
  _open() {
    this._isOpen.value = true;
    this._selectedIndex.value = 0;
    this._query.value = "";
    this._requestRender();
    // Focus input after render
    requestAnimationFrame(() => {
      if (this.domInput) {
        this.domInput.focus();
      }
    });
  }
  /**
   * Close the command palette
   */
  _close() {
    this._isOpen.value = false;
    this._query.value = "";
    this._requestRender();
  }
  /**
   * Navigate selection down
   */
  _navigateDown() {
    const filtered = this._filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const nextIndex = this._selectedIndex.value + 1;
    this._selectedIndex.value = nextIndex >= filtered.length ? 0 : nextIndex;
    this._scrollSelectedIntoView();
  }
  /**
   * Navigate selection up
   */
  _navigateUp() {
    const filtered = this._filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const prevIndex = this._selectedIndex.value - 1;
    this._selectedIndex.value = prevIndex < 0 ? filtered.length - 1 : prevIndex;
    this._scrollSelectedIntoView();
  }
  /**
   * Scroll the selected item into view
   */
  _scrollSelectedIntoView() {
    requestAnimationFrame(() => {
      if (!this.domCommandList) {
        return;
      }
      const selected = this.domCommandList.querySelector(".selected");
      if (selected) {
        selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }
  /**
   * Execute the currently selected command
   */
  _executeSelected() {
    const filtered = this._filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const command = filtered[this._selectedIndex.value];
    if (command) {
      this._execute(command);
    }
  }
  /**
   * Execute a specific command
   */
  _execute(command) {
    command.execute();
    this._close();
  }
  /**
   * Handle input changes from the search field
   */
  _handleInput(e) {
    const target = e.target;
    this._query.value = target.value;
    this._selectedIndex.value = 0;
  }
  /**
   * Set up default application commands
   */
  _setupDefaultCommands() {
    this._commands = [
      {
        id: "new-tournament",
        label: "Create New Tournament",
        icon: "plus",
        shortcut: "⌘N",
        keywords: ["new", "create", "tournament"],
        execute: () => {
          this.dispatchEvent(
            new CustomEvent("navigate", {
              detail: { hash: "#/tournaments" },
              bubbles: true,
              composed: true,
            })
          );
        },
      },
      {
        id: "score-match",
        label: "Score Current Match",
        icon: "play",
        shortcut: "⌘S",
        keywords: ["score", "match", "game"],
        execute: () => {
          // TODO: Implement scoring action
        },
      },
      {
        id: "go-home",
        label: "Go to Home",
        icon: "home",
        shortcut: "⌘H",
        keywords: ["home", "dashboard", "main"],
        execute: () => {
          this.dispatchEvent(
            new CustomEvent("navigate", {
              detail: { hash: "#/home" },
              bubbles: true,
              composed: true,
            })
          );
        },
      },
      {
        id: "config",
        label: "Open Configuration",
        icon: "gear",
        shortcut: "⌘,",
        keywords: ["config", "settings", "preferences"],
        execute: () => {
          this.dispatchEvent(
            new CustomEvent("navigate", {
              detail: { hash: "#/config" },
              bubbles: true,
              composed: true,
            })
          );
        },
      },
    ];
  }
  /**
   * Get filtered commands based on search query
   */
  get _filteredCommands() {
    const query = this._query.value.toLowerCase().trim();
    if (!query) {
      return this._commands;
    }
    return this._commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords.some((k) => k.includes(query));
      return labelMatch || keywordMatch;
    });
  }
  /**
   * Handle overlay click to close palette
   */
  _handleOverlayClick() {
    this._close();
  }
  /**
   * Stop propagation on palette click
   */
  _handlePaletteClick(e) {
    e.stopPropagation();
  }
  /**
   * Handle command item click
   */
  _handleItemClick(index) {
    const filtered = this._filteredCommands;
    const command = filtered[index];
    if (command) {
      this._execute(command);
    }
  }
  _getStyles() {
    return html`
      <style>
        :host { display: block; }
        .palette-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 15vh;
          z-index: 9999;
        }
        .palette {
          background: var(--wa-color-neutral-900, #171717);
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          box-shadow: var(--wa-shadow-x-large, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
          overflow: hidden;
        }
        .search-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--wa-color-neutral-700, #404040);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--wa-color-neutral-100, #f5f5f5);
          font-size: 18px;
          outline: none;
        }
        .search-input:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
        .search-input::placeholder {
          color: var(--wa-color-neutral-500, #737373);
        }
        .command-list {
          list-style: none;
          margin: 0;
          padding: 8px 0;
          max-height: 400px;
          overflow-y: auto;
        }
        .command-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .command-list li:hover,
        .command-list li.selected {
          background: var(--wa-color-neutral-800, #262626);
        }
        .command-list li:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: -2px;
        }
        .command-list li.selected {
          background: var(--wa-color-brand, #6366f1);
        }
        .command-list .label {
          flex: 1;
          color: var(--wa-color-neutral-100, #f5f5f5);
        }
        .command-list .shortcut {
          color: var(--wa-color-neutral-400, #a3a3a3);
          font-size: 12px;
          font-family: monospace;
        }
      </style>
    `;
  }
  _renderCommandItem(cmd, index, selectedIndex) {
    const isSelected = index === selectedIndex;
    return html`
      <li
        class="${isSelected ? "selected" : ""}"
        data-index="${index}"
        role="option"
        aria-selected="${isSelected}"
        @click=${() => this._handleItemClick(index)}
      >
        <mad-icon name="${cmd.icon ?? "command"}"></mad-icon>
        <span class="label">${cmd.label}</span>
        <span class="shortcut">${cmd.shortcut ?? ""}</span>
      </li>
    `;
  }
  _renderContent() {
    if (!this._isOpen.value) {
      return html`${nothing}`;
    }
    const filtered = this._filteredCommands;
    const selectedIndex = this._selectedIndex.value;
    return html`
      ${this._getStyles()}
      <div class="palette-overlay" role="dialog" aria-label="Command Palette" aria-modal="true" @click=${this._handleOverlayClick}>
        <div class="palette" role="document" @click=${this._handlePaletteClick}>
          <div class="search-container">
            <mad-icon name="magnifying-glass"></mad-icon>
            <input
              type="text"
              class="search-input"
              placeholder="Type a command or search..."
              .value="${this._query.value}"
              autocomplete="off"
              autofocus
              aria-label="Search commands"
              @input=${this._handleInput}
            />
          </div>
          <ul class="command-list" role="listbox" aria-label="Commands" aria-live="polite">
            ${filtered.map((cmd, index) => this._renderCommandItem(cmd, index, selectedIndex))}
          </ul>
        </div>
      </div>
    `;
  }
  /**
   * Render the command palette
   */
  _render() {
    this._renderTemplate(this._renderContent());
    // Cache DOM references after render
    this.domInput = this._renderRoot.querySelector(".search-input");
    this.domCommandList = this._renderRoot.querySelector(".command-list");
  }
}
// Register custom element
customElements.define("command-palette", CommandPalette);
