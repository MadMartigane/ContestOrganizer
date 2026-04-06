import { BaseElement } from "@core/base-element";
import { Signal } from "@core/signal";
import { createComponentSheet } from "@core/styles";
import { html, nothing, type TemplateResult } from "lit-html";
import { getTournaments } from "../../modules/init";
import { TeamRow } from "../../modules/team-row/team-row";
import type { GenericTeam } from "../../modules/team-row/team-row.d";
import { Tournaments } from "../../modules/tournaments/tournaments";
import {
  type Tournament,
  TournamentType,
} from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";

const pageTournamentSheet = createComponentSheet(`
  .page-tournament {
    display: block;
  }
`);

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
 *
 * Observed attributes:
 * - `tournament-id`: ID of the tournament to display (numeric string)
 *
 * Custom events:
 * - `navigate`: Fired when navigating to matchs page, detail: { hash: string }
 *
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

  // Property: tournament-id attribute
  private _tournamentId = 0;

  // State signals
  private declare _tournament: Signal<Tournament | null>;
  private declare _uiError: Signal<string | null>;
  private declare _isEditTournamentName: Signal<boolean>;
  private declare _teamNumber: Signal<number>;
  private declare _magicFillLoading: Signal<boolean>;
  private declare _magicFillError: Signal<string | null>;

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
  static get observedAttributes() {
    return ["tournament-id"] as const;
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
    this._magicFillLoading = new Signal<boolean>(false);
    this._magicFillError = new Signal<string | null>(null);

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

    // _initialized is set automatically by BaseElement after this method returns
  }

  protected _injectStyles(): void {
    super._injectStyles(pageTournamentSheet);
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.initTournaments();
  }

  /**
   * Handles attribute changes
   */
  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "tournament-id") {
      const update = (): void => {
        this._tournamentId = value ? Number(value) : 0;
        this.initTournaments();
      };

      if (document.startViewTransition) {
        document.startViewTransition(() => update());
      } else {
        update();
      }
    }
  }

  private async initTournaments(): Promise<number> {
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
  }

  private editTournamentName(): void {
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

    const newName = String((input as HTMLInputElement).value).trim();
    this._tournament.value.name = newName;

    this._isEditTournamentName.value = false;
    this.resizeGrid();
  }

  private goMatch(tournamentId?: number): void {
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

  private handleTournamentNameClick(): void {
    this._isEditTournamentName.value = true;
    // Focus the input after render
    setTimeout(() => {
      const input = this._renderRoot
        .querySelector('mad-input[name="tournamentName"]')
        ?.querySelector("input");
      if (input) {
        (input as HTMLInputElement).focus();
      }
    }, 100);
  }

  private handleTeamNumberInput(event: CustomEvent): void {
    this.onTeamNumberChange(event.detail);
  }

  private handleGridTournamentChange(
    ev: CustomEvent<{ tournamentId?: number }>
  ): void {
    if (ev.detail?.tournamentId) {
      this.refreshTournament(ev.detail.tournamentId);
    }
  }

  protected _render(): void {
    const tournament = this._tournament.value;
    const uiError = this._uiError.value;
    const isEditTournamentName = this._isEditTournamentName.value;
    const teamNumber = this._teamNumber.value;

    const gridTemplate = this.renderGrid();
    const footerActionsTemplate = this.renderFooterActions();

    if (uiError) {
      this._renderTemplate(
        html`<div class="page-tournament">
          <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
            <error-message message="${uiError}"></error-message>
          </div>
        </div>`
      );
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

    this._renderTemplate(
      html`<div class="page-tournament">
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
      </div>`
    );
  }

  private renderGrid(): TemplateResult | typeof nothing {
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

  private renderSortingButton(): TemplateResult | typeof nothing {
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

  private renderFooterActions(): TemplateResult | typeof nothing {
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

  private handleMagicFillClick(): void {
    const gridBasket = this._renderRoot.querySelector("grid-basket") as {
      magicFillUpNbaTeams?: () => Promise<void>;
    } | null;
    gridBasket?.magicFillUpNbaTeams?.();
  }
}

customElements.define("page-tournament", PageTournament);
