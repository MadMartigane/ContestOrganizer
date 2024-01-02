import { InputChangeEventDetail } from '@ionic/core';
import { Component, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';
import { MadInputNumberCustomEvent, MadSelectTeamCustomEvent } from '../../components';
import { Tournament, TournamentUpdateEvent } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import { GenericTeam } from '../../components.d';
import { GridConfConstants } from '../../modules/grid-common/grid-common.types';

@Component({
  tag: 'grid-basket',
  styleUrl: 'grid-basket.css',
  shadow: false,
})
export class GridBasket {
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

  onTeamTeamChange(detail: GenericTeam, team: TeamRow): void {
    team.team = detail;

    this.updateTournament();
  }

  onTeamChange(detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  render() {
    return (
      <Host>
        <ion-grid class="grid-default-grid">
          <ion-row class="grid-default-grid-header ion-align-items-center">
            <ion-col size="1">
              <ion-label color="primary">
                <ion-icon name="swap-vertical-outline"></ion-icon>
              </ion-label>
            </ion-col>
            <ion-col size="3">
              <ion-label color="primary">Équipes</ion-label>
            </ion-col>
            <ion-col>
              <ion-label color="success">Points</ion-label>
            </ion-col>
            <ion-col>
              <ion-label color="secondary">
                Buts <ion-icon name="add-outline"></ion-icon>
              </ion-label>
            </ion-col>
            <ion-col>
              <ion-label color="tertiary">
                Buts <ion-icon name="remove-outline"></ion-icon>
              </ion-label>
            </ion-col>
            <ion-col>
              <ion-label color="warning">Goal average</ion-label>
            </ion-col>
          </ion-row>

          {this.tournament?.grid.map(team => (
            <ion-row class="ion-align-items-center">
              <ion-col size="1">
                <span class="counter">
                  {this.counter > 8 ? null : '0'}
                  {++this.counter}
                </span>
              </ion-col>
              <ion-col size="3">
                <mad-select-team
                  value={team.team}
                  color="primary"
                  type={this.tournament?.type}
                  onMadSelectChange={(ev: MadSelectTeamCustomEvent<GenericTeam>) => this.onTeamTeamChange(ev.detail, team)}
                  placeholder="Équipe vide"
                ></mad-select-team>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={team.points}
                  color="success"
                  min={this.conf.pointMin}
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, 'points')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={team.scoredGoals}
                  min={this.conf.scoredGoalsMin}
                  color="secondary"
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, 'scoredGoals')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number
                  readonly
                  value={team.concededGoals}
                  min={this.conf.concededGoalsMin}
                  color="tertiary"
                  onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, 'concededGoals')}
                  placeholder="0"
                ></mad-input-number>
              </ion-col>
              <ion-col>
                <mad-input-number readonly value={team.goalAverage} color="warning" placeholder="0"></mad-input-number>
              </ion-col>
            </ion-row>
          ))}
        </ion-grid>
      </Host>
    );
  }
}
