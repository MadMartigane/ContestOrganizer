import { BaseElement } from "../../core/base-element.js";
import { Signal } from "../../core/signal.js";
import apiSports from "../../modules/api-sports/api-sports";
import type { ClassifiedError } from "../../modules/error/error.utils";
import { classifyError } from "../../modules/error/error.utils";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types";
import type { GenericTeam } from "../../modules/team-row/team-row.d";
import theSportsDbService from "../../modules/thesportsdb/thesportsdb.service";
import { TournamentType } from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";

/**
 * SelectTeam - A vanilla web component for selecting a team from search results.
 * Replaces the Stencil mad-select-team component.
 * @element mad-select-team
 */
export class SelectTeam extends BaseElement {
  private readonly apiSports = apiSports;

  private domDrawer!: HTMLElement & { show?: () => void; hide?: () => void };
  private domDivBody: HTMLDivElement | null = null;
  private domInputSearch:
    | (HTMLElement & { value: string; disabled: boolean })
    | null = null;
  private domResultsContainer: HTMLElement | null = null;
  private searchValue = "";
  private searchRequestId = 0;
  private readonly minNumberSearchLetter = 3;

  // Bound handlers for cleanup
  private _boundBodyClickHandler: ((ev: Event) => void) | null = null;
  private _boundSearchInputHandler: ((ev: Event) => void) | null = null;
  private _boundCancelClickHandler: ((ev: Event) => void) | null = null;
  private _boundMenuSelectHandler: ((ev: Event) => void) | null = null;
  private _boundRetryClickHandler: (() => void) | null = null;

  // Props as signals (initialized in _setupProperties to run after parent constructor)
  private declare _color: Signal<string>;
  private declare _placeholder: Signal<string>;
  private declare _label: Signal<string>;
  private declare _value: Signal<GenericTeam | null>;
  private declare _type: Signal<TournamentType | null>;
  private declare _tournamentGridId: Signal<number | null>;

  // State signals (initialized in _setupProperties)
  private declare _team: Signal<GenericTeam | null>;
  private declare _isLoading: Signal<boolean>;
  private declare _searchError: Signal<ClassifiedError | null>;
  private declare _suggested: Signal<GenericTeam[]>;

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes(): string[] {
    return [
      "color",
      "placeholder",
      "label",
      "value",
      "type",
      "tournament-grid-id",
    ];
  }

  /**
   * Color property
   */
  get color(): string {
    return this._color.value;
  }

  set color(value: string) {
    this.setAttribute("color", value);
  }

  /**
   * Placeholder property
   */
  get placeholder(): string {
    return this._placeholder.value;
  }

  set placeholder(value: string) {
    this.setAttribute("placeholder", value);
  }

  /**
   * Label property
   */
  get label(): string {
    return this._label.value;
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  /**
   * Value property (selected team)
   */
  get value(): GenericTeam | null {
    return this._value.value;
  }

  set value(val: GenericTeam | null) {
    if (val) {
      this.setAttribute("value", JSON.stringify(val));
    } else {
      this.removeAttribute("value");
    }
  }

  /**
   * Tournament type property
   */
  get type(): TournamentType | null {
    return this._type.value;
  }

  set type(val: TournamentType | null) {
    if (val) {
      this.setAttribute("type", val);
    } else {
      this.removeAttribute("type");
    }
  }

  /**
   * Tournament grid ID property
   */
  get tournamentGridId(): number | null {
    return this._tournamentGridId.value;
  }

  set tournamentGridId(val: number | null) {
    if (val === null) {
      this.removeAttribute("tournament-grid-id");
    } else {
      this.setAttribute("tournament-grid-id", String(val));
    }
  }

  /**
   * Sets up component properties from attributes
   */
  protected _setupProperties(): void {
    this._color = new Signal<string>(this.getAttribute("color") ?? "");
    this._placeholder = new Signal<string>(
      this.getAttribute("placeholder") ?? "Sélectionner une équipe"
    );
    this._label = new Signal<string>(this.getAttribute("label") ?? "");
    this._value = new Signal<GenericTeam | null>(
      this._parseTeamValue(this.getAttribute("value"))
    );
    this._team = new Signal<GenericTeam | null>(this._value.value);
    this._type = new Signal<TournamentType | null>(
      this._parseTypeValue(this.getAttribute("type"))
    );
    this._tournamentGridId = new Signal<number | null>(
      this._parseGridIdValue(this.getAttribute("tournament-grid-id"))
    );
    this._suggested = new Signal<GenericTeam[]>([]);
    this._searchError = new Signal<ClassifiedError | null>(null);
    this._isLoading = new Signal<boolean>(false);

    // Track signals for reactivity
    this._trackSignal(this._color);
    this._trackSignal(this._placeholder);
    this._trackSignal(this._label);
    this._trackSignal(this._value);
    this._trackSignal(this._type);
    this._trackSignal(this._tournamentGridId);
    this._trackSignal(this._team);
    this._trackSignal(this._isLoading);
    this._trackSignal(this._searchError);
    this._trackSignal(this._suggested);

    // Mark initialization as complete to enable rendering
    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this;
  }

  /**
   * Parse team value from attribute safely
   */
  private _parseTeamValue(value: string | null): GenericTeam | null {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as GenericTeam;
    } catch {
      return null;
    }
  }

  /**
   * Parse tournament type from attribute safely
   */
  private _parseTypeValue(value: string | null): TournamentType | null {
    if (!value) {
      return null;
    }
    return value as TournamentType;
  }

  /**
   * Parse grid ID from attribute safely
   */
  private _parseGridIdValue(value: string | null): number | null {
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /**
   * Handles attribute changes
   */
  protected _onAttributeChange(name: string, value: string | null): void {
    switch (name) {
      case "color":
        this._color.value = value ?? "";
        break;
      case "placeholder":
        this._placeholder.value = value ?? "Sélectionner une équipe";
        break;
      case "label":
        this._label.value = value ?? "";
        break;
      case "value":
        this._value.value = this._parseTeamValue(value);
        this._team.value = this._value.value;
        break;
      case "type":
        this._type.value = this._parseTypeValue(value);
        break;
      case "tournament-grid-id":
        this._tournamentGridId.value = this._parseGridIdValue(value);
        break;
      default:
        // Unknown attribute - no action needed
        break;
    }
  }

  /**
   * Cleans up event listeners
   */
  private _cleanupEventListeners(): void {
    if (this.domDivBody && this._boundBodyClickHandler) {
      this.domDivBody.removeEventListener("click", this._boundBodyClickHandler);
      this._boundBodyClickHandler = null;
    }
    if (this.domInputSearch && this._boundSearchInputHandler) {
      this.domInputSearch.removeEventListener(
        "input",
        this._boundSearchInputHandler
      );
      this._boundSearchInputHandler = null;
    }
    if (this.domDrawer && this._boundCancelClickHandler) {
      this.domDrawer.removeEventListener(
        "click",
        this._boundCancelClickHandler
      );
      this._boundCancelClickHandler = null;
    }
    if (this.domResultsContainer && this._boundMenuSelectHandler) {
      this.domResultsContainer.removeEventListener(
        "mad-select",
        this._boundMenuSelectHandler
      );
      this._boundMenuSelectHandler = null;
    }
    if (this.domResultsContainer && this._boundRetryClickHandler) {
      const retryBtn = this.domResultsContainer.querySelector("#retry-btn");
      if (retryBtn) {
        retryBtn.removeEventListener("click", this._boundRetryClickHandler);
      }
      this._boundRetryClickHandler = null;
    }
  }

  disconnectedCallback(): void {
    this._cleanupEventListeners();
    super.disconnectedCallback();
  }

  /**
   * Handle body click to open drawer
   */
  private _handleBodyClick(ev: Event): void {
    ev.stopPropagation();
    this._openDrawer();
  }

  /**
   * Handle search input with debounce
   */
  private _handleSearchInput(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    Utils.debounce("select-team-input-search", () => {
      this._onSearchChange(target.value);
    });
  }

  /**
   * Open the drawer
   */
  private _openDrawer(): void {
    if (this.domDrawer) {
      this.domDrawer.setAttribute("open", "");
      if (this.domInputSearch) {
        Utils.setFocus(this.domInputSearch);
      }
    }
  }

  /**
   * Close the drawer
   */
  private _closeDrawer(): void {
    if (this.domDrawer) {
      this.domDrawer.removeAttribute("open");
    }
  }

  /**
   * Handle search input change
   */
  private async _onSearchChange(value: string): Promise<void> {
    this.searchValue = value;

    if (this.searchValue.length < this.minNumberSearchLetter) {
      this._suggested.value = [];
      this._isLoading.value = false;
      this._searchError.value = null;
      return;
    }

    const requestId = ++this.searchRequestId;
    this._isLoading.value = true;
    this._searchError.value = null;

    try {
      let results: GenericTeam[];
      const tournamentType = this._type.value;
      if (tournamentType === TournamentType.NBA) {
        results = await theSportsDbService.searchTeams(this.searchValue);
      } else if (tournamentType === null) {
        results = [];
      } else {
        results = await this.apiSports.searchTeam(
          tournamentType,
          this.searchValue
        );
      }

      if (requestId === this.searchRequestId) {
        this._suggested.value = results;
        this._scrollOnSearchResult();
      }
    } catch (error) {
      if (requestId === this.searchRequestId) {
        this._searchError.value = classifyError(error);
        this._suggested.value = [];
      }
    } finally {
      if (requestId === this.searchRequestId) {
        this._isLoading.value = false;
      }
    }
  }

  /**
   * Retry search after error
   */
  private _retrySearch(): void {
    this._onSearchChange(this.searchValue);
  }

  /**
   * Scroll to search results
   */
  private _scrollOnSearchResult(): void {
    if (this.domResultsContainer) {
      Utils.scrollIntoView(this.domResultsContainer);
    }
  }

  /**
   * Handle team selection
   */
  private _onTeamSelected(team: GenericTeam): void {
    this._team.value = team;
    this._emit<GridTeamOnUpdateDetail>("madSelectChange", {
      genericTeam: team,
      tournamentGridId: this._tournamentGridId.value ?? null,
    });
    this._closeDrawer();
  }

  /**
   * Handle team radio change event
   */
  private _onTeamRadioChange(ev: CustomEvent): void {
    ev.stopPropagation();

    const detail = ev.detail as { item: HTMLElement };
    const teamId = detail.item?.dataset?.teamId;

    if (teamId) {
      const team = this._suggested.value.find(
        (candidate) => candidate.id === Number(teamId)
      );
      if (team) {
        this._onTeamSelected(team);
      }
    }
  }

  /**
   * Render the error alert
   */
  private _renderErrorAlert(): string {
    const error = this._searchError.value;
    if (!error) {
      return "";
    }

    const retryButton = error.retryable
      ? `<mad-button id="retry-btn" size="small" variant="brand">
           <mad-icon name="arrow-clockwise" slot="start"></mad-icon>
           Réessayer
         </mad-button>`
      : "";

    return `<mad-callout class="my-2" open variant="danger" role="alert" aria-live="polite">
      <mad-icon name="exclamation-triangle" slot="start"></mad-icon>
      <strong>${error.title}</strong>
      <p class="text-sm">${error.message}</p>
      ${retryButton}
    </mad-callout>`;
  }

  /**
   * Render the team result list
   */
  private _renderTeamResultList(): string {
    const teams = this._suggested.value;
    if (!teams.length) {
      return "";
    }

    const items = teams
      .map(
        (team) => `<mad-menu-item data-team-id="${team.id}">
          <mad-team-tile></mad-team-tile>
          <span slot="end">
            <mad-icon class="text-4xl text-neutral-400 dark:text-neutral-500" name="arrow-right-circle"></mad-icon>
          </span>
        </mad-menu-item>`
      )
      .join("");

    return `<mad-menu>${items}</mad-menu>`;
  }

  /**
   * Render the results content
   */
  private _renderResultsContent(): string {
    if (this._isLoading.value) {
      return `<div class="flex flex-col items-center justify-center py-8" role="status" aria-label="Loading teams">
        <div class="mb-3">
          <mad-spinner class="text-4xl"></mad-spinner>
        </div>
        <span class="text-neutral-400 dark:text-neutral-500">Chargement des équipes…</span>
      </div>`;
    }

    if (this._suggested.value.length) {
      return this._renderTeamResultList();
    }

    if (this.searchValue?.length > 2) {
      return `<mad-callout open variant="warning" role="status">
        <mad-icon class="text-6xl text-yellow-600" name="emoji-frown" slot="start"></mad-icon>
        <span class="mx-2 text-2xl">Aucun résultat</span>
      </mad-callout>`;
    }

    return "";
  }

  /**
   * Render the team selection drawer content
   */
  private _renderTeamSelection(): string {
    return `<div class="footer">
      <mad-card>
        <div slot="header">
          <h3>Recherche ton équipe. (${this.minNumberSearchLetter} lettres min)</h3>
        </div>
        <div>
          <div class="my-4">
            <mad-input
              autocomplete="off"
              autofocus
              placeholder="nom d'équipe"
              size="medium"
              type="text"
            >
              <mad-icon name="magnifying-glass" slot="start"></mad-icon>
            </mad-input>
          </div>
          <div id="results-container">
            ${this._renderErrorAlert()}
            ${this._renderResultsContent()}
          </div>
        </div>
      </mad-card>
    </div>`;
  }

  /**
   * Main render method
   */
  protected _render(): void {
    this._cleanupEventListeners();

    const team = this._team.value;
    const label = this._label.value;
    const placeholder = this._placeholder.value;

    // 1. Initialize basic structure if it doesn't exist
    if (!this.domDrawer) {
      this.innerHTML = `<mad-drawer no-header placement="start">
        ${this._renderTeamSelection()}
        <div class="grid-300" slot="footer">
          <mad-button id="cancel-btn" variant="brand">
            Annuler
          </mad-button>
        </div>
      </mad-drawer>
      <div class="cursor-pointer" role="button" tabindex="0" aria-label="Select team, opens team selection dialog">
        <div id="selected-team-container"></div>
      </div>`;

      this.domDrawer = this._renderRoot.querySelector(
        "mad-drawer"
      ) as unknown as HTMLElement;
      this.domDivBody = this._renderRoot.querySelector(".cursor-pointer");
      this.domInputSearch = this._renderRoot.querySelector(
        "mad-input"
      ) as unknown as HTMLElement & {
        value: string;
        disabled: boolean;
      };
      this.domResultsContainer =
        this._renderRoot.querySelector("#results-container");

      this._setupButtonEvents();
      this._setupEvents();
    }

    // 2. Update dynamic parts
    // Update selected team display
    const selectedTeamContainer = this._renderRoot.querySelector(
      "#selected-team-container"
    );
    if (selectedTeamContainer) {
      selectedTeamContainer.innerHTML = `
        ${label ? `<span>${label}</span>` : ""}
        ${
          team?.id
            ? "<mad-team-tile></mad-team-tile>"
            : `<span class="text-neutral-400 dark:text-neutral-500 text-sm">${placeholder}</span>`
        }
      `;

      if (team?.id) {
        const tile = selectedTeamContainer.querySelector("mad-team-tile");
        if (tile && "team" in tile) {
          (tile as HTMLElement & { team: GenericTeam }).team = team;
        }
      }
    }

    // Update results container
    if (this.domResultsContainer) {
      this.domResultsContainer.innerHTML = `
        ${this._renderErrorAlert()}
        ${this._renderResultsContent()}
      `;

      // Set team property on result tiles
      const resultTiles =
        this.domResultsContainer.querySelectorAll("mad-team-tile");
      const teams = this._suggested.value;
      resultTiles.forEach((tile, index) => {
        if (teams[index] && "team" in tile) {
          (tile as HTMLElement & { team: GenericTeam }).team = teams[index];
        }
      });

      // Re-attach menu events if menu exists
      const menu = this.domResultsContainer.querySelector("mad-menu");
      if (menu) {
        this._boundMenuSelectHandler = (ev: Event) => {
          ev.stopPropagation();
          this._onTeamRadioChange(ev as CustomEvent);
        };
        menu.addEventListener("mad-select", this._boundMenuSelectHandler);
      }

      // Re-attach retry button event if it exists
      const retryBtn = this.domResultsContainer.querySelector("#retry-btn");
      if (retryBtn) {
        this._boundRetryClickHandler = () => {
          this._retrySearch();
        };
        retryBtn.addEventListener("click", this._boundRetryClickHandler);
      }
    }
  }

  /**
   * Sets up event handlers
   */
  private _setupEvents(): void {
    // Handle body click to open drawer
    if (this.domDivBody) {
      this._boundBodyClickHandler = this._handleBodyClick.bind(this);
      this.domDivBody.addEventListener("click", this._boundBodyClickHandler);

      // Add keyboard handler for Enter/Space to open drawer
      this.domDivBody.addEventListener("keydown", (ev: Event) => {
        const keyboardEvent = ev as KeyboardEvent;
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          ev.preventDefault();
          this._openDrawer();
        }
      });
    }

    // Handle search input with debounce
    if (this.domInputSearch) {
      this._boundSearchInputHandler = this._handleSearchInput.bind(this);
      this.domInputSearch.addEventListener(
        "input",
        this._boundSearchInputHandler
      );
    }
  }

  /**
   * Setup button event handlers after DOM is ready
   * Uses event delegation on the drawer element to handle clicks
   * even on cloned/re-rendered buttons
   */
  private _setupButtonEvents(): void {
    if (this.domDrawer) {
      this._boundCancelClickHandler = (ev: Event) => {
        const target = ev.target as HTMLElement;
        if (target.closest("#cancel-btn")) {
          this._closeDrawer();
        }
      };
      this.domDrawer.addEventListener("click", this._boundCancelClickHandler);
    }
  }
}

// Register the custom element
customElements.define("mad-select-team", SelectTeam);
