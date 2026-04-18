import { html, nothing, type TemplateResult } from "lit-html";
import { BaseElement } from "../../core/base-element";
import { Signal } from "../../core/signal";
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
      const inputSearch = this._renderRoot.querySelector("mad-input");
      if (inputSearch) {
        Utils.setFocus(inputSearch as HTMLElement);
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
    const resultsContainer =
      this._renderRoot.querySelector("#results-container");
    if (resultsContainer) {
      Utils.scrollIntoView(resultsContainer as HTMLElement);
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
   * Render the error alert
   */
  private _renderErrorAlert(): TemplateResult | typeof nothing {
    const error = this._searchError.value;
    if (!error) {
      return nothing;
    }

    const retryButton = error.retryable
      ? html`<mad-button
          id="retry-btn"
          size="small"
          variant="brand"
          @click=${this._retrySearch}
        >
          <mad-icon name="arrow-clockwise" slot="start"></mad-icon>
          Réessayer
        </mad-button>`
      : nothing;

    return html`<mad-callout
      class="my-2"
      open
      variant="danger"
      role="alert"
      aria-live="polite"
    >
      <mad-icon name="exclamation-triangle" slot="start"></mad-icon>
      <strong>${error.title}</strong>
      <p class="text-sm">${error.message}</p>
      ${retryButton}
    </mad-callout>`;
  }

  /**
   * Render the team result list
   */
  private _renderTeamResultList(): TemplateResult | typeof nothing {
    const teams = this._suggested.value;
    if (!teams.length) {
      return nothing;
    }

    const items = teams.map(
      (team) => html`<mad-menu-item
        data-team-id="${team.id}"
        @click=${() => this._onTeamSelected(team)}
      >
        <mad-team-tile .team=${team}></mad-team-tile>
        <span slot="end">
          <mad-icon
            class="text-4xl text-neutral-400 dark:text-neutral-500"
            name="arrow-right-circle"
          ></mad-icon>
        </span>
      </mad-menu-item>`
    );

    return html`<mad-menu>${items}</mad-menu>`;
  }

  /**
   * Render the results content
   */
  private _renderResultsContent(): TemplateResult | typeof nothing {
    if (this._isLoading.value) {
      return html`<div
        class="flex flex-col items-center justify-center py-8"
        role="status"
        aria-label="Loading teams"
      >
        <div class="mb-3">
          <mad-spinner class="text-4xl"></mad-spinner>
        </div>
        <span class="text-neutral-400 dark:text-neutral-500"
          >Chargement des équipes…</span
        >
      </div>`;
    }

    if (this._suggested.value.length) {
      return this._renderTeamResultList();
    }

    if (this.searchValue?.length > 2) {
      return html`<mad-callout open variant="warning" role="status">
        <mad-icon
          class="text-6xl text-yellow-600"
          name="emoji-frown"
          slot="start"
        ></mad-icon>
        <span class="mx-2 text-2xl">Aucun résultat</span>
      </mad-callout>`;
    }

    return nothing;
  }

  /**
   * Render the team selection drawer content
   */
  private _renderTeamSelection(): TemplateResult {
    const errorAlert = this._renderErrorAlert();
    const resultsContent = this._renderResultsContent();

    return html`<div class="footer">
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
              @input=${this._handleSearchInput}
            >
              <mad-icon name="magnifying-glass" slot="start"></mad-icon>
            </mad-input>
          </div>
          <div id="results-container">
            ${errorAlert}
            ${resultsContent}
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

    const teamSelectionContent = this._renderTeamSelection();

    this._renderTemplate(html`
      <style>
        .footer {
          grid-template-columns: 300px;
        }
      </style>
      <mad-drawer no-header placement="start">
        ${teamSelectionContent}
        <div class="grid-300" slot="footer">
          <mad-button id="cancel-btn" variant="brand" @click=${this._closeDrawer}>
            Annuler
          </mad-button>
        </div>
      </mad-drawer>
      <div
        class="cursor-pointer"
        role="button"
        tabindex="0"
        aria-label="Select team, opens team selection dialog"
        @click=${this._openDrawer}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            this._openDrawer();
          }
        }}
      >
        <div id="selected-team-container">
          ${label ? html`<span>${label}</span>` : nothing}
          ${
            team?.id
              ? html`<mad-team-tile .team=${team}></mad-team-tile>`
              : html`<span
                  class="text-neutral-400 dark:text-neutral-500 text-sm"
                  >${placeholder}</span
                >`
          }
        </div>
      </div>
    `);

    // Store drawer reference for programmatic control
    this.domDrawer = this._renderRoot.querySelector(
      "mad-drawer"
    ) as unknown as HTMLElement & { show?: () => void; hide?: () => void };
  }
}

// Register the custom element
customElements.define("mad-select-team", SelectTeam);
