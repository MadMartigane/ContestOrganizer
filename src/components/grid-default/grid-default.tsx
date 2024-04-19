import { Component, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';
import { Tournament, TournamentUpdateEvent } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import { GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';

@Component({
  tag: 'grid-default',
  styleUrl: 'grid-default.css',
  shadow: false,
})
export class GridDefault {
  private readonly tournaments: typeof tournaments;

  private counter: number;

  @State() private tournament: Tournament | null;

  @Prop() public tournamentId: number | null;

  @Event() gridTournamentChange: EventEmitter<TournamentUpdateEvent>;

  constructor() {
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

  render() {
    return (
      <Host>
        <ion-grid class="default-grid">
          <ion-row class="default-grid-header ion-align-items-center">
            <ion-col size="1">
              <sl-icon class="ion-hide-sm-down l" name="sort-numeric-down"></sl-icon>
              <sl-icon class="ion-hide-sm-up m" name="sort-numeric-down"></sl-icon>
            </ion-col>
            <ion-col size="3">
              <span>Équipes</span>
            </ion-col>
            <ion-col>
              <span class="success">Points</span>
            </ion-col>
            <ion-col class="secondary">
              <span>Buts</span>
              <sl-icon name="plus-lg" class="m"></sl-icon>
            </ion-col>
            <ion-col class="tertiary">
              <span>Buts</span>
              <sl-icon name="dash-lg" class="s"></sl-icon>
            </ion-col>
            <ion-col>
              <span class="warning">Goal average</span>
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
                <span class="success">{gridRow.points}</span>
              </ion-col>
              <ion-col>
                <span class="secondary">{gridRow.scoredGoals}</span>
              </ion-col>
              <ion-col>
                <span class="tertiary">{gridRow.concededGoals}</span>
              </ion-col>
              <ion-col>
                <span class="warning">{gridRow.goalAverage}</span>
              </ion-col>
            </ion-row>
          ))}
        </ion-grid>
      </Host>
    );
  }
}
