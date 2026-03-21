import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";
import { Component, Host, h, Prop, State } from "@stencil/core";
import type { GenericTeam } from "../../components.d";
import { getTournaments } from "../../modules/init";
import { TeamRow } from "../../modules/team-row/team-row";
import { Tournaments } from "../../modules/tournaments/tournaments";
import {
  type Tournament,
  TournamentType,
} from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";

export interface PageConfConstants {
  concededGoalsMin: number;
  inputDebounce: number;
  pointMin: number;
  scoredGoalsMin: number;
  teamNumberDefault: number;
  teamNumberMax: number;
  teamNumberMin: number;
  teamNumberStep: number;
}

@Component({
  tag: "page-tournament",
  styleUrl: "page-tournament.css",
  shadow: false,
})
export class PageTournament {
  // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
  private readonly tournaments = getTournaments();
  private readonly conf: PageConfConstants;
  private readonly basketGridCompliants: TournamentType[] = [
    TournamentType.NBA,
    TournamentType.BASKET,
    TournamentType.NFL,
    TournamentType.RUGBY,
  ];

  private domInputTournamentName: SlInput;
  private domDivTournamentName: HTMLElement;

  @Prop() tournamentId: number;

  @State() private tournament: Tournament | null;
  @State() private uiError: string | null;
  @State() private isEditTournamentName: boolean;
  @State() private teamNumber: number;

  constructor() {
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
    // Migration: tournaments instance is now obtained via field initializer (getTournaments)

    this.uiError = null;
    this.isEditTournamentName = false;

    this.initTournaments();
  }

  private async initTournaments(): Promise<number> {
    this.tournament = await this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return Promise.resolve(0);
    }

    this.teamNumber =
      this.tournament.grid.length || this.conf.teamNumberDefault;
    return this.resizeGrid();
  }

  private onTeamNumberChange(detail?: { value: string }): void {
    this.teamNumber = Number(detail?.value || this.conf.teamNumberDefault);
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

    this.tournament = tournament;
    this.teamNumber = tournament.grid.length;
  }

  /**
   * Resizes the tournament grid based on current teamNumber state and persists to store.
   * Used when user manually changes team count via UI controls.
   */
  private async resizeGrid(): Promise<number> {
    if (!this.tournament) {
      return 0;
    }

    const oldGrid = this.tournament.grid;
    // Change ref to refresh UI
    this.tournament = {
      id: this.tournament.id,
      name: this.tournament.name,
      grid: [] as TeamRow[],
      matchs: this.tournament.matchs,
      type: this.tournament.type,
    };

    for (let i = 0; i < this.teamNumber; i++) {
      this.tournament.grid[i] =
        oldGrid[i] || this.getVirginTeamRow(this.tournament.type);
    }

    return await this.tournaments.update(this.tournament);
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
    if (!this.tournament) {
      return;
    }

    this.tournament.grid = Tournaments.sortGrid(this.tournament.grid);

    this.resizeGrid();
  }

  private resetGrid(): void {
    if (!this.tournament) {
      return;
    }

    this.tournament.grid = [];
    this.tournament.matchs = [];
    this.teamNumber = this.conf.teamNumberDefault;
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

  private onTournamentNameChange(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") {
      this.editTournamentName();
      return;
    }

    if (event.key === "Escape") {
      this.isEditTournamentName = false;
      return;
    }
  }

  private editTournamentName() {
    if (!this.tournament) {
      return;
    }

    const newName = String(this.domInputTournamentName.value).trim();
    this.tournament.name = newName;

    this.isEditTournamentName = false;
    this.resizeGrid();
  }

  private goMatch(tournamentId?: number) {
    if (tournamentId) {
      window.location.hash = `/match/${tournamentId}`;
    }
  }

  componentDidUpdate() {
    Utils.installEventHandler(this.domDivTournamentName, "click", () => {
      this.isEditTournamentName = true;
    });

    if (this.domInputTournamentName) {
      Utils.setFocus(this.domInputTournamentName as unknown as HTMLElement);
    }
  }

  private renderGrid() {
    if (!this.tournament) {
      return null;
    }

    if (this.basketGridCompliants.includes(this.tournament.type)) {
      return (
        <grid-basket
          onGridTournamentChange={(ev) => {
            ev.detail?.tournamentId &&
              this.refreshTournament(ev.detail.tournamentId);
          }}
          tournamentId={this.tournament.id}
        />
      );
    }

    return (
      <grid-default
        onGridTournamentChange={(ev) => {
          ev.detail?.tournamentId &&
            this.refreshTournament(ev.detail.tournamentId);
        }}
        tournamentId={this.tournament.id}
      />
    );
  }

  private renderSortingButton() {
    if (!this.tournament) {
      return null;
    }

    if (this.basketGridCompliants.includes(this.tournament.type)) {
      return null;
    }

    return (
      <sl-button
        onclick={() => this.goRanking()}
        size="large"
        variant="secondary"
      >
        <sl-icon name="sort-numeric-down" slot="prefix" />
        <span slot="suffix">Classement !</span>
      </sl-button>
    );
  }

  private renderFooterActions() {
    return (
      <div class="grid-300 my-4">
        <sl-button
          onclick={() => this.confirmResetGrid()}
          size="large"
          variant="warning"
        >
          <sl-icon name="trash" slot="prefix" />
          <span slot="suffix">Effacer</span>
        </sl-button>

        {this.renderSortingButton()}

        <sl-button
          onclick={() => this.goMatch(this.tournament?.id)}
          size="large"
          variant="primary"
        >
          <sl-icon name="trophy" slot="prefix" />
          <span>Go Match</span>
          <sl-icon name="forward" slot="suffix" />
        </sl-button>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon class="text-2xl" name="house" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item href="#/tournaments">
            <sl-icon class="text-2xl" name="trophy" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="card-list" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          {this.uiError ? (
            <error-message message={this.uiError} />
          ) : (
            <div>
              {this.isEditTournamentName ? (
                <div class="my-4 grid grid-cols-1 items-center text-center">
                  <sl-input
                    autocomplete="off"
                    autofocus
                    name="tournamentName"
                    onblur={() => this.editTournamentName()}
                    onkeydown={(ev: KeyboardEvent) =>
                      this.onTournamentNameChange(ev)
                    }
                    ref={(el: SlInput) => {
                      this.domInputTournamentName = el;
                    }}
                    type="text"
                    value={this.tournament?.name}
                  />
                </div>
              ) : (
                <div>
                  <div
                    class="grid grid-cols-1 items-center text-center"
                    ref={(el: HTMLDivElement) => {
                      this.domDivTournamentName = el as HTMLElement;
                    }}
                  >
                    <h1 class="can-be-clicked text-center">
                      {this.tournament?.name}
                    </h1>
                  </div>
                </div>
              )}

              <div class="my-4 grid grid-cols-1 items-center text-center">
                <mad-input-number
                  label={`Nombre d’équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})`}
                  max={this.conf.teamNumberMax}
                  min={this.conf.teamNumberMin}
                  onMadNumberChange={(ev: CustomEvent) =>
                    this.onTeamNumberChange(ev.detail)
                  }
                  placeholder={String(this.conf.teamNumberDefault)}
                  step={this.conf.teamNumberStep}
                  value={this.teamNumber}
                />
              </div>

              {this.teamNumber > 0 ? (
                <div>
                  <div class="w-fill overflow-x-auto">{this.renderGrid()}</div>
                  {this.renderFooterActions()}
                </div>
              ) : (
                <div>
                  <h2 class="">
                    {" "}
                    Choisissez le nombre d’équipes pour commencer !{" "}
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
