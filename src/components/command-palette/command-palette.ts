import "./command-palette.css";
import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";

/**
 * Command palette component for desktop (⌘K) inspired by VS Code/Linear.
 * Provides quick access to application commands via keyboard shortcut.
 * @element command-palette
 */
export class CommandPalette extends BaseElement {
  private static readonly shortcutKey = "k";
  private static readonly modifierKeys = ["metaKey", "ctrlKey"];

  // State signals
  private declare _isOpen: Signal<boolean>;
  private declare _query: Signal<string>;
  private declare _selectedIndex: Signal<number>;

  // Command registry
  private _commands: Command[] = [];

  // DOM references
  private domInput: HTMLInputElement | null = null;
  private domCommandList: HTMLUListElement | null = null;

  protected _setupProperties(): void {
    this._isOpen = new Signal<boolean>(false);
    this._query = new Signal<string>("");
    this._selectedIndex = new Signal<number>(0);

    this._trackSignal(this._isOpen);
    this._trackSignal(this._query);
    this._trackSignal(this._selectedIndex);

    this._initialized = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.handleGlobalKeydown);
    this.setupDefaultCommands();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleGlobalKeydown);
  }

  /**
   * Handle global keyboard shortcuts
   */
  private readonly handleGlobalKeydown = (e: KeyboardEvent): void => {
    // Open palette with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if (this.isModifierKeyPressed(e) && e.key === CommandPalette.shortcutKey) {
      e.preventDefault();
      this.toggle();
      return;
    }

    // Close on Escape when open
    if (e.key === "Escape" && this._isOpen.value) {
      e.preventDefault();
      this.close();
      return;
    }

    // Navigate list when open
    if (!this._isOpen.value) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.navigateDown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.navigateUp();
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.executeSelected();
    }
  };

  /**
   * Check if modifier key is pressed (Cmd on Mac, Ctrl on Windows/Linux)
   */
  private isModifierKeyPressed(e: KeyboardEvent): boolean {
    return CommandPalette.modifierKeys.some(
      (key) => e[key as keyof KeyboardEvent]
    );
  }

  /**
   * Toggle palette open/closed state
   */
  private toggle(): void {
    if (this._isOpen.value) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the command palette
   */
  private open(): void {
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
  private close(): void {
    this._isOpen.value = false;
    this._query.value = "";
    this._requestRender();
  }

  /**
   * Navigate selection down
   */
  private navigateDown(): void {
    const filtered = this.filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const nextIndex = this._selectedIndex.value + 1;
    this._selectedIndex.value = nextIndex >= filtered.length ? 0 : nextIndex;
    this.scrollSelectedIntoView();
  }

  /**
   * Navigate selection up
   */
  private navigateUp(): void {
    const filtered = this.filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const prevIndex = this._selectedIndex.value - 1;
    this._selectedIndex.value = prevIndex < 0 ? filtered.length - 1 : prevIndex;
    this.scrollSelectedIntoView();
  }

  /**
   * Scroll the selected item into view
   */
  private scrollSelectedIntoView(): void {
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
  private executeSelected(): void {
    const filtered = this.filteredCommands;
    if (filtered.length === 0) {
      return;
    }
    const command = filtered[this._selectedIndex.value];
    if (command) {
      this.execute(command);
    }
  }

  /**
   * Execute a specific command
   */
  private execute(command: Command): void {
    command.execute();
    this.close();
  }

  /**
   * Handle input changes from the search field
   */
  private readonly handleInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    this._query.value = target.value;
    this._selectedIndex.value = 0;
  };

  /**
   * Set up default application commands
   */
  private setupDefaultCommands(): void {
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
  private get filteredCommands(): Command[] {
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
  private readonly handleOverlayClick = (): void => {
    this.close();
  };

  /**
   * Stop propagation on palette click
   */
  private readonly handlePaletteClick = (e: Event): void => {
    e.stopPropagation();
  };

  /**
   * Render the command palette
   */
  protected _render(): void {
    if (!this._isOpen.value) {
      this.innerHTML = "";
      return;
    }

    const filtered = this.filteredCommands;
    const selectedIndex = this._selectedIndex.value;

    const commandItems = filtered
      .map(
        (cmd, index) => `
      <li class="${index === selectedIndex ? "selected" : ""}" data-index="${index}">
        <mad-icon name="${cmd.icon ?? "command"}"></mad-icon>
        <span class="label">${cmd.label}</span>
        <span class="shortcut">${cmd.shortcut ?? ""}</span>
      </li>
    `
      )
      .join("");

    this.innerHTML = `
      <div class="palette-overlay">
        <div class="palette">
          <div class="search-container">
            <mad-icon name="magnifying-glass"></mad-icon>
            <input
              type="text"
              class="search-input"
              placeholder="Type a command or search..."
              value="${this._query.value}"
              autocomplete="off"
              autofocus
            />
          </div>
          <ul class="command-list">
            ${commandItems}
          </ul>
        </div>
      </div>
    `;

    // Cache DOM references
    this.domInput = this.querySelector(".search-input");
    this.domCommandList = this.querySelector(".command-list");

    // Attach event listeners
    if (this.domInput) {
      this.domInput.addEventListener("input", this.handleInput);
    }

    const overlay = this.querySelector(".palette-overlay");
    const palette = this.querySelector(".palette");

    if (overlay) {
      overlay.addEventListener("click", this.handleOverlayClick);
    }

    if (palette) {
      palette.addEventListener("click", this.handlePaletteClick);
    }

    // Attach click handlers to command items
    if (this.domCommandList) {
      const items = Array.from(this.domCommandList.querySelectorAll("li"));
      for (const item of items) {
        item.addEventListener("click", () => {
          const index = Number(item.dataset.index);
          const command = filtered[index];
          if (command) {
            this.execute(command);
          }
        });
      }
    }
  }
}

/**
 * Command interface defining a palette command
 */
interface Command {
  execute: () => void;
  icon?: string;
  id: string;
  keywords: string[];
  label: string;
  shortcut?: string;
}

// Register custom element
customElements.define("command-palette", CommandPalette);
