import { InputChangeEventDetail } from '@ionic/core';
import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';
import { MadInputNumberCustomEvent } from '../../components';
import tournaments from '../../modules/tournaments/tournaments';
import { Tournament, TournamentType } from '../../modules/tournaments/tournaments.types';
import Utils from '../../modules/utils/utils';
import { GenericTeam } from '../../components.d';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component';

export interface PageConfConstants {
  teamNumberMax: number;
  teamNumberMin: number;
  teamNumberDefault: number;
  scoredGoalsMin: number;
  concededGoalsMin: number;
  teamNumberStep: number;
  pointMin: number;
  inputDebounce: number;
}

@Component({
  tag: 'page-tournament',
  styleUrl: 'page-tournament.css',
  shadow: false,
})
export class PageTournament {
  private readonly tournaments: typeof tournaments;
  private readonly conf: PageConfConstants;
  private readonly basketGridCompliants: Array<TournamentType> = [TournamentType.NBA, TournamentType.BASKET, TournamentType.NFL, TournamentType.RUGBY];

  private domInputTournamentName: SlInput;
  private domDivTournamentName: HTMLElement;

  @Prop() public tournamentId: number;

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
    this.tournaments = tournaments;

    this.uiError = null;
    this.isEditTournamentName = false;

    this.initTournaments();
  }

  @Listen('ionRouteDidChange', {
    target: 'window',
  })
  routerGoesHere() {
    this.updateTournament();
  }

  private async initTournaments(): Promise<number> {
    this.tournament = await this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return Promise.resolve(0);
    }

    this.teamNumber = this.tournament.grid.length || this.conf.teamNumberDefault;
    return this.updateTournament();
  }

  private onTeamNumberChange(detail?: InputChangeEventDetail): void {
    this.teamNumber = Number((detail && detail.value) || this.conf.teamNumberDefault);
    this.updateTournament();
  }

  private getVirginTeamRow(type: TournamentType): TeamRow {
    return new TeamRow({ type });
  }

  private async updateTournament(tournamentId?: number): Promise<number> {
    if (tournamentId) {
      this.tournament = await this.tournaments.get(tournamentId);
    }

    if (!this.tournament) {
      return Promise.resolve(0);
    }

    const oldGrid = this.tournament.grid;
    // Change ref to refresh UI
    this.tournament = {
      id: this.tournament.id,
      name: this.tournament.name,
      grid: [] as Array<TeamRow>,
      matchs: this.tournament.matchs,
      type: this.tournament.type,
    };

    for (let i = 0; i < this.teamNumber; i++) {
      this.tournament.grid[i] = oldGrid[i] || this.getVirginTeamRow(this.tournament.type);
    }

    return this.tournaments.update(this.tournament);
  }

  onTeamTeamChange(detail: GenericTeam, team: TeamRow): void {
    team.team = detail;

    this.updateTournament();
  }

  onTeamChange(detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  private goRanking(): void {
    if (!this.tournament) {
      return;
    }

    const gridClone = this.tournament.grid.map(team => team) as Array<TeamRow>;
    gridClone.sort((a: TeamRow, b: TeamRow) => b.goalAverage - a.goalAverage);
    this.tournament.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);

    this.updateTournament();
  }

  private resetGrid(): void {
    if (!this.tournament) {
      return;
    }

    this.tournament.grid = [];
    this.tournament.matchs = [];
    this.teamNumber = this.conf.teamNumberDefault;
    this.updateTournament();
  }

  private async confirmResetGrid(): Promise<void> {
    const confirm = await Utils.confirmChoice('Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ?');
    if (confirm) {
      this.resetGrid();
    }
  }

  private onTournamentNameChange(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      this.editTournamentName();
      return;
    }

    if (event.key === 'Escape') {
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
    this.updateTournament();
  }

  private goMatch(tournamentId?: number) {
    if (tournamentId) {
      window.location.hash = `/match/${tournamentId}`;
    }
  }

  public componentDidUpdate() {
    Utils.installEventHandler(this.domDivTournamentName, 'click', () => {
      this.isEditTournamentName = true;
    });

    if (this.domInputTournamentName) {
      Utils.setFocus(this.domInputTournamentName);
    }
  }

  private renderGrid() {
    if (!this.tournament) {
      return null;
    }

    if (this.basketGridCompliants.includes(this.tournament.type)) {
      return (
        <grid-basket
          tournamentId={this.tournament.id}
          onGridTournamentChange={ev => {
            this.updateTournament(ev.detail.tournamentId);
          }}
        ></grid-basket>
      );
    }

    return (
      <grid-default
        tournamentId={this.tournament.id}
        onGridTournamentChange={ev => {
          this.updateTournament(ev.detail.tournamentId);
        }}
      ></grid-default>
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
      <sl-button variant="secondary" onclick={() => this.goRanking()} size="large">
        <sl-icon name="sort-numeric-down" slot="prefix"></sl-icon>
        <span slot="suffix">Classement !</span>
      </sl-button>
    );
  }

  private renderFooterActions() {
    return (
      <div class="grid-300">
        <sl-button onclick={() => this.confirmResetGrid()} variant="warning" size="large">
          <sl-icon name="trash" slot="prefix"></sl-icon>
          <span slot="suffix">Effacer</span>
        </sl-button>

        {this.renderSortingButton()}

        <sl-button onclick={() => this.goMatch(this.tournament?.id)} size="large" variant="primary">
          <sl-icon name="trophy" slot="prefix"></sl-icon>
          <span>Go Match</span>
          <sl-icon slot="suffix" name="forward"></sl-icon>
        </sl-button>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon name="house" class="xl"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item href="#/tournaments">
            <sl-icon name="trophy" class="xl"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon name="card-list" class="xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          {this.uiError ? (
            <div>
              <sl-alert variant="danger" open>
                <sl-icon slot="icon" name="bug" class="2xl"></sl-icon>
                <h1>Erreur</h1>
                <br />
                <span>{this.uiError}</span>
              </sl-alert>
            </div>
          ) : (
            <div>
              {this.isEditTournamentName ? (
                <div class="grid-300">
                  <sl-input
                    ref={(el: SlInput) => {
                      this.domInputTournamentName = el;
                    }}
                    autofocus
                    type="text"
                    autocomplete="off"
                    name="tournamentName"
                    value={this.tournament?.name}
                    onkeydown={(ev: KeyboardEvent) => this.onTournamentNameChange(ev)}
                    onblur={() => this.editTournamentName()}
                  />
                </div>
              ) : (
                <div>
                  <div
                    class="grid-300"
                    ref={(el: HTMLDivElement) => {
                      this.domDivTournamentName = el as HTMLElement;
                    }}
                  >
                    <h1 class="can-be-clicked text-center">{this.tournament?.name}</h1>
                  </div>
                </div>
              )}

              <div class="grid grid-cols-1 text-center items-center">
                <mad-input-number
                  value={this.teamNumber}
                  label={`Nombre d’équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})`}
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamNumberChange(ev.detail)}
                  min={this.conf.teamNumberMin}
                  max={this.conf.teamNumberMax}
                  step={this.conf.teamNumberStep}
                  placeholder={String(this.conf.teamNumberDefault)}
                ></mad-input-number>
              </div>

              {this.teamNumber > 0 ? (
                <div>
                  <div class="w-fill overflow-x-auto">{this.renderGrid()}</div>
                  {this.renderFooterActions()}
                </div>
              ) : (
                <div>
                  <h2 class=""> Choisissez le nombre d’équipes pour commencer ! </h2>
                </div>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
