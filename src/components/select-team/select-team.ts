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

  private domDrawer: HTMLElement & { show?: () => void; hide?: () => void };
  private domDivBody: HTMLDivElement | null = null;
  private domInputSearch:
    | (HTMLElement & { value: string; disabled: boolean })
    | null = null;
  private domResultsContainer: HTMLElement | null = null;
  private searchValue = "";
  private searchRequestId = 0;
  private readonly minNumberSearchLetter = 3;

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
   * Sets up event handlers
   */
  protected _setupEvents(): void {
    // Handle body click to open drawer
    if (this.domDivBody) {
      this.domDivBody.addEventListener("click", (ev: Event) => {
        ev.stopPropagation();
        this.openDrawer();
      });
    }

    // Handle search input with debounce
    if (this.domInputSearch) {
      this.domInputSearch.addEventListener("input", (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        Utils.debounce("select-team-input-search", () => {
          this.onSearchChange(target.value);
        });
      });
    }
  }

  /**
   * Open the drawer
   */
  private openDrawer(): void {
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
  private closeDrawer(): void {
    if (this.domDrawer) {
      this.domDrawer.removeAttribute("open");
    }
  }

  /**
   * Handle search input change
   */
  private async onSearchChange(value: string): Promise<void> {
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
        this.scrollOnSearchResult();
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
  private retrySearch(): void {
    this.onSearchChange(this.searchValue);
  }

  /**
   * Scroll to search results
   */
  private scrollOnSearchResult(): void {
    if (this.domResultsContainer) {
      Utils.scrollIntoView(this.domResultsContainer);
    }
  }

  /**
   * Handle team selection
   */
  private onTeamSelected(team: GenericTeam): void {
    this._team.value = team;
    this._emit<GridTeamOnUpdateDetail>("madSelectChange", {
      genericTeam: team,
      tournamentGridId: this._tournamentGridId.value ?? null,
    });
    this.closeDrawer();
  }

  /**
   * Handle team radio change event
   */
  private onTeamRadioChange(ev: CustomEvent): void {
    ev.stopPropagation();

    const detail = ev.detail as { item: HTMLElement };
    const teamId = detail.item?.dataset?.teamId;

    if (teamId) {
      const team = this._suggested.value.find(
        (candidate) => candidate.id === Number(teamId)
      );
      if (team) {
        this.onTeamSelected(team);
      }
    }
  }

  /**
   * Render the error alert
   */
  private renderErrorAlert(): string {
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

    return `<mad-callout class="my-2" open variant="danger">
      <mad-icon name="exclamation-triangle" slot="start"></mad-icon>
      <strong>${error.title}</strong>
      <p class="text-sm">${error.message}</p>
      ${retryButton}
    </mad-callout>`;
  }

  /**
   * Render the team result list
   */
  private renderTeamResultList(): string {
    const teams = this._suggested.value;
    if (!teams.length) {
      return "";
    }

    const items = teams
      .map(
        (team) => `<mad-menu-item data-team-id="${team.id}">
          <mad-team-tile></mad-team-tile>
          <span slot="end">
            <mad-icon class="text-4xl text-neutral-400" name="arrow-right-circle"></mad-icon>
          </span>
        </mad-menu-item>`
      )
      .join("");

    return `<mad-menu>${items}</mad-menu>`;
  }

  /**
   * Render the results content
   */
  private renderResultsContent(): string {
    if (this._isLoading.value) {
      return `<div class="flex flex-col items-center justify-center py-8">
        <div class="mb-3">
          <mad-spinner class="text-4xl"></mad-spinner>
        </div>
        <span class="text-neutral-400">Chargement des équipes…</span>
      </div>`;
    }

    if (this._suggested.value.length) {
      return this.renderTeamResultList();
    }

    if (this.searchValue?.length > 2) {
      return `<mad-callout open variant="warning">
        <mad-icon class="text-6xl text-yellow-600" name="emoji-frown" slot="start"></mad-icon>
        <span class="mx-2 text-2xl">Aucun résultat</span>
      </mad-callout>`;
    }

    return "";
  }

  /**
   * Render the team selection drawer content
   */
  private renderTeamSelection(): string {
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
            ${this.renderErrorAlert()}
            ${this.renderResultsContent()}
          </div>
        </div>
      </mad-card>
    </div>`;
  }

  /**
   * Main render method
   */
  protected _render(): void {
    const team = this._team.value;
    const label = this._label.value;
    const placeholder = this._placeholder.value;

    // 1. Initialize basic structure if it doesn't exist
    if (!this.domDrawer) {
      this.innerHTML = `<mad-drawer no-header placement="start">
        ${this.renderTeamSelection()}
        <div class="grid-300" slot="footer">
          <mad-button id="cancel-btn" variant="brand">
            Annuler
          </mad-button>
        </div>
      </mad-drawer>
      <div class="cursor-pointer">
        <div id="selected-team-container"></div>
      </div>`;

      this.domDrawer = this.querySelector(
        "mad-drawer"
      ) as unknown as HTMLElement;
      this.domDivBody = this.querySelector(".cursor-pointer");
      this.domInputSearch = this.querySelector(
        "mad-input"
      ) as unknown as HTMLElement & {
        value: string;
        disabled: boolean;
      };
      this.domResultsContainer = this.querySelector("#results-container");

      this.setupButtonEvents();
      this._setupEvents();
    }

    // 2. Update dynamic parts
    // Update selected team display
    const selectedTeamContainer = this.querySelector(
      "#selected-team-container"
    );
    if (selectedTeamContainer) {
      selectedTeamContainer.innerHTML = `
        ${label ? `<span>${label}</span>` : ""}
        ${
          team?.id
            ? "<mad-team-tile></mad-team-tile>"
            : `<span class="text-neutral-400 text-sm">${placeholder}</span>`
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
        ${this.renderErrorAlert()}
        ${this.renderResultsContent()}
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
        menu.addEventListener("mad-select", (ev: Event) => {
          ev.stopPropagation();
          this.onTeamRadioChange(ev as CustomEvent);
        });
      }

      // Re-attach retry button event if it exists
      const retryBtn = this.domResultsContainer.querySelector("#retry-btn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          this.retrySearch();
        });
      }
    }
  }

  /**
   * Setup button event handlers after DOM is ready
   */
  private setupButtonEvents(): void {
    // Cancel button
    const cancelBtn = this.querySelector("#cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeDrawer();
      });
    }
  }
}

// Register the custom element
customElements.define("mad-select-team", SelectTeam);
