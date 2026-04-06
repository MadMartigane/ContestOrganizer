import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { html, nothing } from "lit-html";
import { getTournaments } from "../../modules/init.js";
import { TeamRow } from "../../modules/team-row/team-row.js";
import { Tournaments } from "../../modules/tournaments/tournaments.js";
import { TournamentType } from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";
/**
 * PageTournament - Tournament page component for viewing and editing tournament details
 * @element page-tournament
 * @fires navigate
 */
export class PageTournament extends BaseElement {
  tournaments = getTournaments();
  basketGridCompliants = [
    TournamentType.NBA,
    TournamentType.BASKET,
    TournamentType.NFL,
    TournamentType.RUGBY,
  ];
  // Property: tournament-id attribute
  _tournamentId = 0;
  /**
   * Tournament ID property
   */
  get tournamentId() {
    return this._tournamentId;
  }
  set tournamentId(value) {
    this.setAttribute("tournament-id", String(value));
  }
  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return ["tournament-id"];
  }
  _setupProperties() {
    this.conf = {
      teamNumberDefault: 4,
      teamNumberMax: 32,
      teamNumberMin: 2,
      teamNumberStep: 2,
      scoredGoalsMin: 0,
      concededGoalsMin: 0,
      pointMin: 0,
      inputDebounce: 300,
    };
    // Initialize signals
    this._tournament = new Signal(null);
    this._uiError = new Signal(null);
    this._isEditTournamentName = new Signal(false);
    this._teamNumber = new Signal(this.conf.teamNumberDefault);
    this._magicFillLoading = new Signal(false);
    this._magicFillError = new Signal(null);
    // Track signals for reactivity
    this._trackSignal(this._tournament);
    this._trackSignal(this._uiError);
    this._trackSignal(this._isEditTournamentName);
    this._trackSignal(this._teamNumber);
    this._trackSignal(this._magicFillLoading);
    this._trackSignal(this._magicFillError);
    // Initialize from attributes
    const tournamentIdAttr = this.getAttribute("tournament-id");
    this._tournamentId = tournamentIdAttr ? Number(tournamentIdAttr) : 0;
    // Mark initialization as complete to enable rendering
    this._initialized = true;
  }
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this.initTournaments();
  }
  /**
   * Handles attribute changes
   */
  _onAttributeChange(name, value) {
    if (name === "tournament-id") {
      this._tournamentId = value ? Number(value) : 0;
      this.initTournaments();
    }
  }
  async initTournaments() {
    this._tournament.value = await this.tournaments.get(this._tournamentId);
    if (!this._tournament.value) {
      this._uiError.value = `Tournois #${this._tournamentId} non trouvé.`;
      return 0;
    }
    // CLEAR ERROR ON SUCCESS - defense against stale error state
    this._uiError.value = null;
    this._teamNumber.value =
      this._tournament.value.grid.length || this.conf.teamNumberDefault;
    return this.resizeGrid();
  }
  onTeamNumberChange(detail) {
    this._teamNumber.value = Number(
      detail?.value || this.conf.teamNumberDefault
    );
    this.resizeGrid();
  }
  getVirginTeamRow(type) {
    return new TeamRow({ type });
  }
  /**
   * Refreshes tournament state from an external source (e.g., gridTournamentChange event from Magic fill-up).
   * Fetches the latest tournament data from store and updates local state.
   * Does NOT persist to store - this is a read-only refresh operation.
   */
  async refreshTournament(tournamentId) {
    const tournament = await this.tournaments.get(tournamentId);
    if (!tournament) {
      return;
    }
    this._tournament.value = tournament;
    this._teamNumber.value = tournament.grid.length;
  }
  /**
   * Resizes the tournament grid based on current teamNumber state and persists to store.
   * Used when user manually changes team count via UI controls.
   */
  async resizeGrid() {
    if (!this._tournament.value) {
      return 0;
    }
    const oldGrid = this._tournament.value.grid;
    // Change ref to refresh UI
    this._tournament.value = {
      id: this._tournament.value.id,
      name: this._tournament.value.name,
      grid: [],
      matchs: this._tournament.value.matchs,
      type: this._tournament.value.type,
    };
    for (let i = 0; i < this._teamNumber.value; i++) {
      this._tournament.value.grid[i] =
        oldGrid[i] || this.getVirginTeamRow(this._tournament.value.type);
    }
    return await this.tournaments.update(this._tournament.value);
  }
  onTeamTeamChange(detail, team) {
    team.team = detail;
    this.resizeGrid();
  }
  onTeamChange(detail, team, key) {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;
    this.resizeGrid();
  }
  goRanking() {
    if (!this._tournament.value) {
      return;
    }
    this._tournament.value.grid = Tournaments.sortGrid(
      this._tournament.value.grid
    );
    this.resizeGrid();
  }
  resetGrid() {
    if (!this._tournament.value) {
      return;
    }
    this._tournament.value.grid = [];
    this._tournament.value.matchs = [];
    this._teamNumber.value = this.conf.teamNumberDefault;
    this.resizeGrid();
  }
  async confirmResetGrid() {
    const confirm = await Utils.confirmChoice(
      "Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ?"
    );
    if (confirm) {
      this.resetGrid();
    }
  }
  onTournamentNameChange(event) {
    if (event.key === "Enter" || event.key === "Escape") {
      this.editTournamentName();
      return;
    }
  }
  editTournamentName() {
    if (!this._tournament.value) {
      return;
    }
    const tournamentNameInput = this._renderRoot.querySelector(
      'mad-input[name="tournamentName"]'
    );
    if (!tournamentNameInput) {
      return;
    }
    const input = tournamentNameInput.querySelector("input");
    if (!input) {
      return;
    }
    const newName = String(input.value).trim();
    this._tournament.value.name = newName;
    this._isEditTournamentName.value = false;
    this.resizeGrid();
  }
  goMatch(tournamentId) {
    if (tournamentId) {
      this.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { hash: `#/matchs/${tournamentId}` },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
  handleTournamentNameClick() {
    this._isEditTournamentName.value = true;
    // Focus the input after render
    setTimeout(() => {
      const input = this._renderRoot
        .querySelector('mad-input[name="tournamentName"]')
        ?.querySelector("input");
      if (input) {
        input.focus();
      }
    }, 100);
  }
  handleTeamNumberInput(event) {
    this.onTeamNumberChange(event.detail);
  }
  handleGridTournamentChange(ev) {
    if (ev.detail?.tournamentId) {
      this.refreshTournament(ev.detail.tournamentId);
    }
  }
  _render() {
    const tournament = this._tournament.value;
    const uiError = this._uiError.value;
    const isEditTournamentName = this._isEditTournamentName.value;
    const teamNumber = this._teamNumber.value;
    const gridTemplate = this.renderGrid();
    const footerActionsTemplate = this.renderFooterActions();
    if (uiError) {
      this._renderTemplate(html`<div class="page-tournament">
          <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
            <error-message message="${uiError}"></error-message>
          </div>
        </div>`);
      return;
    }
    const tournamentNameTemplate = isEditTournamentName
      ? html`<div class="my-4 grid grid-cols-1 items-center text-center">
            <mad-input
              autocomplete="off"
              autofocus
              name="tournamentName"
              type="text"
              .value=${tournament?.name ?? ""}
              @keydown="${this.onTournamentNameChange}"
              @blur="${this.editTournamentName}"
            ></mad-input>
          </div>`
      : html`<div>
            <div
              class="grid grid-cols-1 items-center text-center"
              id="divTournamentName"
              @click="${this.handleTournamentNameClick}"
            >
              <h1 class="can-be-clicked text-center">
                ${tournament?.name}
              </h1>
            </div>
          </div>`;
    const gridContentTemplate =
      teamNumber > 0
        ? html`<div>
              <div class="w-fill overflow-x-auto">${gridTemplate}</div>
              ${footerActionsTemplate}
            </div>`
        : html`<div>
              <h2 class="">Choisissez le nombre d'équipes pour commencer !</h2>
            </div>`;
    this._renderTemplate(html`<style>
          .page-tournament {
            display: block;
          }
        </style>
        <div class="page-tournament">
          <div part="base">
            <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-[var(--wa-color-neutral-100)] dark:bg-neutral-800 rounded-lg shadow-md">
            <div>
              <slot name="tournament-name"></slot>

              ${tournamentNameTemplate}

              <div class="my-4 grid grid-cols-1 items-center text-center">
                <mad-input-number
                  id="teamNumberInput"
                  label="Nombre d'équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})"
                  max="${this.conf.teamNumberMax}"
                  min="${this.conf.teamNumberMin}"
                  placeholder="${this.conf.teamNumberDefault}"
                  step="${this.conf.teamNumberStep}"
                  .value=${teamNumber}
                  @madNumberChange="${this.handleTeamNumberInput}"
                ></mad-input-number>
              </div>

              <slot name="grid-content"></slot>

              ${gridContentTemplate}
            </div>
          </div>
        </div>
      </div>`);
  }
  renderGrid() {
    if (!this._tournament.value) {
      return nothing;
    }
    if (this.basketGridCompliants.includes(this._tournament.value.type)) {
      return html`<grid-basket
        tournament-id="${this._tournament.value.id}"
        @gridTournamentChange=${this.handleGridTournamentChange}
      ></grid-basket>`;
    }
    return html`<grid-default
      tournament-id="${this._tournament.value.id}"
      @gridTournamentChange=${this.handleGridTournamentChange}
    ></grid-default>`;
  }
  renderSortingButton() {
    if (!this._tournament.value) {
      return nothing;
    }
    if (this.basketGridCompliants.includes(this._tournament.value.type)) {
      return nothing;
    }
    return html`<mad-button
        id="rankingBtn"
        size="large"
        variant="secondary"
        @click="${this.goRanking}"
      >
        <mad-icon name="sort-numeric-down" slot="start"></mad-icon>
        <span slot="end">Classement !</span>
      </mad-button>`;
  }
  renderFooterActions() {
    const tournament = this._tournament.value;
    const isNbaType = tournament?.type === "NBA";
    const magicFillError = this._magicFillError.value;
    const magicFillLoading = this._magicFillLoading.value;
    return html`<div class="grid-300 my-4">
        <mad-button
          id="resetBtn"
          size="large"
          variant="warning"
          @click="${this.confirmResetGrid}"
        >
          <mad-icon name="trash" slot="start"></mad-icon>
          <span slot="end">Effacer</span>
        </mad-button>

        ${this.renderSortingButton()}

        ${
          isNbaType
            ? html`<mad-button
                id="magicFillBtn"
                size="large"
                variant="brand"
                ?disabled=${magicFillLoading}
                @click="${this.handleMagicFillClick}"
              >
                <mad-icon name="magic" slot="start"></mad-icon>
                ${magicFillLoading ? "Chargement..." : "Magic fill-up"}
              </mad-button>`
            : nothing
        }

        <mad-button
          id="matchBtn"
          size="large"
          variant="brand"
          @click="${() => this.goMatch(this._tournament.value?.id)}"
        >
          <mad-icon name="trophy" slot="start"></mad-icon>
          <span slot="end">Go Match</span>
          <mad-icon name="forward" slot="end"></mad-icon>
        </mad-button>
      </div>
      ${
        magicFillError
          ? html`<p class="text-red-600 text-sm my-2">${magicFillError}</p>`
          : nothing
      }`;
  }
  handleMagicFillClick() {
    const gridBasket = this._renderRoot.querySelector("grid-basket");
    gridBasket?.magicFillUpNbaTeams?.();
  }
}
customElements.define("page-tournament", PageTournament);
