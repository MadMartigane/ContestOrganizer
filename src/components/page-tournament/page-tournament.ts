import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { getTournaments } from "../../modules/init.js";
import type { GenericTeam } from "../../modules/team-row/team-row.d.js";
import { TeamRow } from "../../modules/team-row/team-row.js";
import { Tournaments } from "../../modules/tournaments/tournaments.js";
import {
  type Tournament,
  TournamentType,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";

interface PageConfConstants {
  concededGoalsMin: number;
  inputDebounce: number;
  pointMin: number;
  scoredGoalsMin: number;
  teamNumberDefault: number;
  teamNumberMax: number;
  teamNumberMin: number;
  teamNumberStep: number;
}

/**
 * PageTournament - Tournament page component for viewing and editing tournament details
 * @element page-tournament
 */
export class PageTournament extends BaseElement {
  private readonly tournaments = getTournaments();
  private declare conf: PageConfConstants;
  private readonly basketGridCompliants: TournamentType[] = [
    TournamentType.NBA,
    TournamentType.BASKET,
    TournamentType.NFL,
    TournamentType.RUGBY,
  ];

  private domInputTournamentName: HTMLInputElement | null = null;
  private domDivTournamentName: HTMLElement | null = null;

  // Property: tournament-id attribute
  private _tournamentId = 0;

  // State signals
  private declare _tournament: Signal<Tournament | null>;
  private declare _uiError: Signal<string | null>;
  private declare _isEditTournamentName: Signal<boolean>;
  private declare _teamNumber: Signal<number>;

  /**
   * Tournament ID property
   */
  get tournamentId(): number {
    return this._tournamentId;
  }

  set tournamentId(value: number) {
    this.setAttribute("tournament-id", String(value));
  }

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes(): string[] {
    return ["tournament-id"];
  }

  protected _setupProperties(): void {
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
    this._tournament = new Signal<Tournament | null>(null);
    this._uiError = new Signal<string | null>(null);
    this._isEditTournamentName = new Signal<boolean>(false);
    this._teamNumber = new Signal<number>(this.conf.teamNumberDefault);

    // Track signals for reactivity
    this._trackSignal(this._tournament);
    this._trackSignal(this._uiError);
    this._trackSignal(this._isEditTournamentName);
    this._trackSignal(this._teamNumber);

    // Initialize from attributes
    const tournamentIdAttr = this.getAttribute("tournament-id");
    this._tournamentId = tournamentIdAttr ? Number(tournamentIdAttr) : 0;

    // Mark initialization as complete to enable rendering
    this._initialized = true;
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.initTournaments();
  }

  /**
   * Use Light DOM for Shoelace compatibility
   */
  protected _createRenderRoot(): Element {
    return this;
  }

  /**
   * Handles attribute changes
   */
  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "tournament-id") {
      this._tournamentId = value ? Number(value) : 0;
      this.initTournaments();
    }
  }

  private async initTournaments(): Promise<number> {
    this._tournament.value = await this.tournaments.get(this._tournamentId);

    if (!this._tournament.value) {
      this._uiError.value = `Tournois #${this._tournamentId} non trouvé.`;
      return 0;
    }

    this._teamNumber.value =
      this._tournament.value.grid.length || this.conf.teamNumberDefault;
    return this.resizeGrid();
  }

  private onTeamNumberChange(detail?: { value: string }): void {
    this._teamNumber.value = Number(
      detail?.value || this.conf.teamNumberDefault
    );
    this.resizeGrid();
  }

  private getVirginTeamRow(type: TournamentType): TeamRow {
    return new TeamRow({ type });
  }

  /**
   * Refreshes tournament state from an external source (e.g., gridTournamentChange event from Magic fill-up).
   * Fetches the latest tournament data from store and updates local state.
   * Does NOT persist to store - this is a read-only refresh operation.
   */
  private async refreshTournament(tournamentId: number): Promise<void> {
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
  private async resizeGrid(): Promise<number> {
    if (!this._tournament.value) {
      return 0;
    }

    const oldGrid = this._tournament.value.grid;
    // Change ref to refresh UI
    this._tournament.value = {
      id: this._tournament.value.id,
      name: this._tournament.value.name,
      grid: [] as TeamRow[],
      matchs: this._tournament.value.matchs,
      type: this._tournament.value.type,
    };

    for (let i = 0; i < this._teamNumber.value; i++) {
      this._tournament.value.grid[i] =
        oldGrid[i] || this.getVirginTeamRow(this._tournament.value.type);
    }

    return await this.tournaments.update(this._tournament.value);
  }

  onTeamTeamChange(detail: GenericTeam, team: TeamRow): void {
    team.team = detail;

    this.resizeGrid();
  }

  onTeamChange(detail: { value: string }, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.resizeGrid();
  }

  private goRanking(): void {
    if (!this._tournament.value) {
      return;
    }

    this._tournament.value.grid = Tournaments.sortGrid(
      this._tournament.value.grid
    );

    this.resizeGrid();
  }

  private resetGrid(): void {
    if (!this._tournament.value) {
      return;
    }

    this._tournament.value.grid = [];
    this._tournament.value.matchs = [];
    this._teamNumber.value = this.conf.teamNumberDefault;
    this.resizeGrid();
  }

  private async confirmResetGrid(): Promise<void> {
    const confirm = await Utils.confirmChoice(
      "Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ?"
    );
    if (confirm) {
      this.resetGrid();
    }
  }

  private onTournamentNameChange(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === "Escape") {
      this.editTournamentName();
      return;
    }

    if (event.key === "Escape") {
      this._isEditTournamentName.value = false;
      return;
    }
  }

  private editTournamentName(): void {
    if (!(this._tournament.value && this.domInputTournamentName)) {
      return;
    }

    const newName = String(this.domInputTournamentName.value).trim();
    this._tournament.value.name = newName;

    this._isEditTournamentName.value = false;
    this.resizeGrid();
  }

  private goMatch(tournamentId?: number): void {
    if (tournamentId) {
      window.location.hash = `/match/${tournamentId}`;
    }
  }

  protected _render(): void {
    const tournament = this._tournament.value;
    const uiError = this._uiError.value;
    const isEditTournamentName = this._isEditTournamentName.value;
    const teamNumber = this._teamNumber.value;

    const gridHtml = this.renderGrid();
    const footerActionsHtml = this.renderFooterActions();

    if (uiError) {
      this.innerHTML = `
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon class="text-2xl" name="house"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item href="#/tournaments">
            <sl-icon class="text-2xl" name="trophy"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="card-list"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>
        <div class="page-content">
          <error-message message="${uiError}"></error-message>
        </div>
      `;
      return;
    }

    const tournamentNameHtml = isEditTournamentName
      ? `
        <div class="my-4 grid grid-cols-1 items-center text-center">
          <sl-input
            autocomplete="off"
            autofocus
            id="tournamentName"
            name="tournamentName"
            type="text"
            value="${tournament?.name ?? ""}"
          ></sl-input>
        </div>
      `
      : `
        <div>
          <div
            class="grid grid-cols-1 items-center text-center"
            id="divTournamentName"
          >
            <h1 class="can-be-clicked text-center">
              ${tournament?.name}
            </h1>
          </div>
        </div>
      `;

    const gridContentHtml =
      teamNumber > 0
        ? `
          <div>
            <div class="w-fill overflow-x-auto">${gridHtml}</div>
            ${footerActionsHtml}
          </div>
        `
        : `
          <div>
            <h2 class="">
              Choisissez le nombre d'équipes pour commencer !
            </h2>
          </div>
        `;

    this.innerHTML = `
      <sl-breadcrumb>
        <sl-breadcrumb-item href="#/home">
          <sl-icon class="text-2xl" name="house"></sl-icon>
        </sl-breadcrumb-item>
        <sl-breadcrumb-item href="#/tournaments">
          <sl-icon class="text-2xl" name="trophy"></sl-icon>
        </sl-breadcrumb-item>
        <sl-breadcrumb-item>
          <sl-icon class="text-2xl" name="card-list"></sl-icon>
        </sl-breadcrumb-item>
      </sl-breadcrumb>

      <div class="page-content">
        <div>
          ${tournamentNameHtml}

          <div class="my-4 grid grid-cols-1 items-center text-center">
            <mad-input-number
              id="teamNumberInput"
              label="Nombre d'équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})"
              max="${this.conf.teamNumberMax}"
              min="${this.conf.teamNumberMin}"
              placeholder="${this.conf.teamNumberDefault}"
              step="${this.conf.teamNumberStep}"
              value="${teamNumber}"
            ></mad-input-number>
          </div>

          ${gridContentHtml}
        </div>
      </div>
    `;

    this._setupEvents();
  }

  private _setupEvents(): void {
    // Setup tournament name edit events
    this.domDivTournamentName = this.querySelector(
      "#divTournamentName"
    ) as HTMLElement;
    if (this.domDivTournamentName) {
      Utils.installEventHandler(this.domDivTournamentName, "click", () => {
        this._isEditTournamentName.value = true;
        // Focus the input after render
        setTimeout(() => {
          const input = this.querySelector(
            'sl-input[name="tournamentName"]'
          )?.querySelector("input");
          if (input) {
            (input as HTMLInputElement).focus();
          }
        }, 100);
      });
    }

    // Setup tournament name input
    const tournamentNameInput = this.querySelector(
      'sl-input[name="tournamentName"]'
    ) as HTMLElement & { focus: () => void };
    if (tournamentNameInput) {
      this.domInputTournamentName = tournamentNameInput.querySelector(
        "input"
      ) as HTMLInputElement;

      if (this.domInputTournamentName) {
        this.domInputTournamentName.addEventListener("keydown", (ev) => {
          this.onTournamentNameChange(ev);
        });

        this.domInputTournamentName.addEventListener("blur", () => {
          this.editTournamentName();
        });
      }
    }

    // Setup team number input events
    const teamNumberInput = this.querySelector(
      "#teamNumberInput"
    ) as HTMLElement;
    if (teamNumberInput) {
      teamNumberInput.addEventListener("madNumberChange", (ev: CustomEvent) => {
        this.onTeamNumberChange(ev.detail);
      });
    }

    // Setup grid child events
    const gridBasket = this.querySelector("grid-basket");
    const gridDefault = this.querySelector("grid-default");

    if (gridBasket) {
      gridBasket.addEventListener(
        "gridTournamentChange",
        (ev: CustomEvent<{ tournamentId?: number }>) => {
          if (ev.detail?.tournamentId) {
            this.refreshTournament(ev.detail.tournamentId);
          }
        }
      );
    }

    if (gridDefault) {
      gridDefault.addEventListener(
        "gridTournamentChange",
        (ev: CustomEvent<{ tournamentId?: number }>) => {
          if (ev.detail?.tournamentId) {
            this.refreshTournament(ev.detail.tournamentId);
          }
        }
      );
    }

    // Setup footer action buttons
    const resetBtn = this.querySelector("#resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.confirmResetGrid();
      });
    }

    const rankingBtn = this.querySelector("#rankingBtn");
    if (rankingBtn) {
      rankingBtn.addEventListener("click", () => {
        this.goRanking();
      });
    }

    const matchBtn = this.querySelector("#matchBtn");
    if (matchBtn) {
      matchBtn.addEventListener("click", () => {
        this.goMatch(this._tournament.value?.id);
      });
    }
  }

  private renderGrid(): string {
    if (!this._tournament.value) {
      return "";
    }

    if (this.basketGridCompliants.includes(this._tournament.value.type)) {
      return `<grid-basket tournament-id="${this._tournament.value.id}"></grid-basket>`;
    }

    return `<grid-default tournament-id="${this._tournament.value.id}"></grid-default>`;
  }

  private renderSortingButton(): string {
    if (!this._tournament.value) {
      return "";
    }

    if (this.basketGridCompliants.includes(this._tournament.value.type)) {
      return "";
    }

    return `
      <sl-button
        id="rankingBtn"
        size="large"
        variant="secondary"
      >
        <sl-icon name="sort-numeric-down" slot="prefix"></sl-icon>
        <span slot="suffix">Classement !</span>
      </sl-button>
    `;
  }

  private renderFooterActions(): string {
    return `
      <div class="grid-300 my-4">
        <sl-button
          id="resetBtn"
          size="large"
          variant="warning"
        >
          <sl-icon name="trash" slot="prefix"></sl-icon>
          <span slot="suffix">Effacer</span>
        </sl-button>

        ${this.renderSortingButton()}

        <sl-button
          id="matchBtn"
          size="large"
          variant="primary"
        >
          <sl-icon name="trophy" slot="prefix"></sl-icon>
          <span>Go Match</span>
          <sl-icon name="forward" slot="suffix"></sl-icon>
        </sl-button>
      </div>
    `;
  }
}

customElements.define("page-tournament", PageTournament);
