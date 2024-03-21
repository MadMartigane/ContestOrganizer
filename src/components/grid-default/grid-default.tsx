import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';
import { MadInputNumberCustomEvent } from '../../components';
import { Tournament, TournamentUpdateEvent } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import { GridConfConstants, GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';

@Component({
  tag: 'grid-default',
  styleUrl: 'grid-default.css',
  shadow: false,
})
export class GridDefault {
  private readonly conf: GridConfConstants;
  private readonly tournaments: typeof tournaments;

  private counter: number;

  @State() private tournament: Tournament | null;

  @Prop() public tournamentId: number | null;

  @Event() gridTournamentChange: EventEmitter<TournamentUpdateEvent>;

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

    this.forceGridRender();
    this.tournaments.onUpdate(() => this.onExternalTournamentUpdate());
  }

  private async forceGridRender() {
    this.tournament = null;
    this.counter = 0;

    this.tournament = await this.tournaments.get(this.tournamentId);
  }

  private onExternalTournamentUpdate() {
    this.forceGridRender();
  }

  private updateTournament(): void {
    if (this.tournament) {
      this.gridTournamentChange.emit({ tournamentId: this.tournament.id });
    }
  }

  private onTeamTeamChange(detail: GridTeamOnUpdateDetail): void {
    const gridRaw = this.tournament?.grid.find(grid => grid.id === detail.tournamentGridId);

    if (gridRaw) {
      gridRaw.team = detail.genericTeam;
    }

    this.updateTournament();
  }

  private onTeamChange(detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  render() {
    return (
      <Host>
        <ion-grid class="default-grid">
          <ion-row class="default-grid-header ion-align-items-center">
            <ion-col size="1">
              <mad-icon class="ion-hide-sm-down" name="format-line-height" primary></mad-icon>
              <mad-icon class="ion-hide-sm-up" name="format-line-height" primary s></mad-icon>
            </ion-col>
            <ion-col size="3">
              <ion-text color="primary">Équipes</ion-text>
            </ion-col>
            <ion-col>
              <ion-text color="success">Points</ion-text>
            </ion-col>
            <ion-col>
              <ion-text color="secondary">Buts</ion-text>
              <mad-icon name="math-plus" s secondary></mad-icon>
            </ion-col>
            <ion-col>
              <ion-text color="tertiary">Buts</ion-text>
              <mad-icon name="math-minus" xs tertiary></mad-icon>
            </ion-col>
            <ion-col>
              <ion-text color="warning">Goal average</ion-text>
            </ion-col>
          </ion-row>

          {this.tournament?.grid.map(gridRow => (
            <ion-row class="ion-align-items-center">
              <ion-col size="1">
                <span class="counter">
                  {this.counter > 8 ? null : '0'}
                  {++this.counter}
                </span>
              </ion-col>
              <ion-col size="3">
                <mad-select-team
                  value={gridRow.team}
                  color="primary"
                  type={this.tournament?.type}
                  tournamentGridId={gridRow.id}
                  onMadSelectChange={(ev: CustomEvent<GridTeamOnUpdateDetail>) => this.onTeamTeamChange(ev.detail)}
                  placeholder="Équipe vide"
                ></mad-select-team>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={gridRow.points}
                  color="success"
                  min={this.conf.pointMin}
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, gridRow, 'points')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={gridRow.scoredGoals}
                  min={this.conf.scoredGoalsMin}
                  color="secondary"
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, gridRow, 'scoredGoals')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={gridRow.concededGoals}
                  min={this.conf.concededGoalsMin}
                  color="tertiary"
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, gridRow, 'concededGoals')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number readonly value={gridRow.goalAverage} color="warning" placeholder="0"></mad-input-number>
              </ion-col>
            </ion-row>
          ))}
        </ion-grid>
      </Host>
    );
  }
}
