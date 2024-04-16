import { Component, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';
import { Tournament, TournamentUpdateEvent } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import Basket from '../../modules/data-basket/data-basket';
import { GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';

@Component({
  tag: 'grid-basket',
  styleUrl: 'grid-basket.css',
  shadow: false,
})
export class GridBasket {
  private readonly tournaments: typeof tournaments;

  @State() private tournament: Tournament | null;

  @Prop() public tournamentId: number | null;

  @Event() gridTournamentChange: EventEmitter<TournamentUpdateEvent>;

  constructor() {
    this.tournament = null;
    this.tournamentId = null;

    this.tournaments = tournaments;

    this.forceGridRender();
    this.tournaments.onUpdate(() => this.onExternalTournamentUpdate());
    this.getTournamentFormatedDatas();
  }

  private async forceGridRender() {
    this.tournament = null;

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

  private getTournamentFormatedDatas() {
    if (!this.tournament) {
      return null;
    }

    return Basket.data(this.tournament);
  }

  private renderGridHeader() {
    return (
      <ion-row class="basket-grid-header ion-align-items-center">
        <ion-col size="1">
          <sl-icon name="sort-numeric-down" class="l"></sl-icon>
        </ion-col>
        <ion-col size="3">
          <span class="ion-hide-sm-down">Équipes</span>
          <span class="ion-hide-sm-up">Éq</span>
        </ion-col>
        <ion-col>
          <span class="ion-hide-sm-down">Joués</span>
          <span class="ion-hide-sm-up">J</span>
        </ion-col>
        <ion-col>
          <span class="success ion-hide-sm-down">Gagnés</span>
          <span class="success ion-hide-sm-up">G</span>
        </ion-col>
        <ion-col>
          <span class="secondary ion-hide-sm-down">Perdus</span>
          <span class="secondary ion-hide-sm-up">P</span>
        </ion-col>
        <ion-col>
          <sl-icon class="ion-hide-sm-down l" name="percent"></sl-icon>
          <sl-icon class="ion-hide-sm-up m" name="percent"></sl-icon>
        </ion-col>
        <ion-col>
          <span class="ion-hide-md-down success">Points </span>
          <span class="ion-hide-lg-down success">Marqués</span>
          <span class="ion-hide-lg-up">
            <sl-icon class="ion-hide-sm-down success l" name="plus-lg"></sl-icon>
            <sl-icon class="ion-hide-sm-up success m" name="plus-lg"></sl-icon>
          </span>
        </ion-col>
        <ion-col>
          <span class="ion-hide-md-down secondary">Points </span>
          <span class="ion-hide-lg-down secondary">Encaissés</span>
          <span class="ion-hide-lg-up secondary">
            <sl-icon class="ion-hide-sm-down l" name="dash-lg"></sl-icon>
            <sl-icon class="ion-hide-sm-up m" name="dash-lg"></sl-icon>
          </span>
        </ion-col>
      </ion-row>
    );
  }

  private renderGridBody() {
    let counter = 0;
    const gridDatas = this.getTournamentFormatedDatas();
    if (!gridDatas) {
      // TODO: display message ?!
      return null;
    }

    return gridDatas.map(gridData => (
      <ion-row class="ion-align-items-center">
        <ion-col size="1">
          <span class="counter">
            {counter > 8 ? null : '0'}
            {++counter}
          </span>
        </ion-col>
        <ion-col size="3">
          <mad-select-team
            value={gridData?.team}
            color="dark"
            type={this.tournament?.type}
            tournamentGridId={gridData?.tournamentGridId}
            onMadSelectChange={(ev: CustomEvent<GridTeamOnUpdateDetail>) => this.onTeamTeamChange(ev.detail)}
            placeholder="Équipe vide"
          ></mad-select-team>
        </ion-col>
        <ion-col>
          <ion-label color="dark">{(gridData?.winGames || 0) + (gridData?.looseGames || 0)}</ion-label>
        </ion-col>
        <ion-col>
          <span class="success">{gridData?.winGames}</span>
        </ion-col>
        <ion-col>
          <span class="secondary">{gridData?.looseGames}</span>
        </ion-col>
        <ion-col>
          <span>{gridData?.winGamesPercent}</span>
        </ion-col>
        <ion-col>
          <span class="success">{gridData?.scoredPoints}</span>
        </ion-col>
        <ion-col>
          <span class="secondary">{gridData?.concededPoints}</span>
        </ion-col>
      </ion-row>
    ));
  }

  render() {
    return (
      <Host>
        <ion-grid class="basket-grid">
          {this.renderGridHeader()}
          {this.tournament && this.renderGridBody()}
        </ion-grid>
      </Host>
    );
  }
}
