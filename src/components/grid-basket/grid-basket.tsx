import { Component, Event, EventEmitter, h, Host, Prop, State } from '@stencil/core';
import { Tournament, TournamentUpdateEvent } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import Basket from '../../modules/data-basket/data-basket';
import { BasketGridConfConstants } from '../../modules/data-basket/data-basket.types';
import { GridTeamOnUpdateDetail } from '../../modules/grid-common/grid-common.types';

@Component({
  tag: 'grid-basket',
  styleUrl: 'grid-basket.css',
  shadow: false,
})
export class GridBasket {
  private readonly conf: BasketGridConfConstants;
  private readonly tournaments: typeof tournaments;

  @State() private tournament: Tournament | null;

  @Prop() public tournamentId: number | null;

  @Event() gridTournamentChange: EventEmitter<TournamentUpdateEvent>;

  constructor() {
    this.conf = {
      concededPointsMin: 0,
      scoredPointsMin: 0,
      looseGamesMin: 0,
      winGamesMin: 0,
      winGamesPercentMin: 0,
    };

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
          <ion-label color="primary">
            <ion-icon name="swap-vertical-outline"></ion-icon>
          </ion-label>
        </ion-col>
        <ion-col size="3">
          <ion-label color="primary">
            <ion-text class="ion-hide-sm-down">Équipes</ion-text>
            <ion-text class="ion-hide-sm-up">Éq</ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="primary">
            <ion-text class="ion-hide-sm-down">Joués</ion-text>
            <ion-text class="ion-hide-sm-up">J</ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="success">
            <ion-text class="ion-hide-sm-down">Gagnés</ion-text>
            <ion-text class="ion-hide-sm-up">G</ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="secondary">
            <ion-text class="ion-hide-sm-down">Perdus</ion-text>
            <ion-text class="ion-hide-sm-up">P</ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="primary">
            <ion-icon class="ion-hide-sm-down" name="stats-chart-outline"></ion-icon>
            <ion-text> %</ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="success">
            <ion-text class="ion-hide-md-down">Points </ion-text>
            <ion-text class="ion-hide-lg-down">Marqués</ion-text>
            <ion-text class="ion-hide-lg-up">
              <ion-icon name="add-outline"></ion-icon>
            </ion-text>
          </ion-label>
        </ion-col>
        <ion-col>
          <ion-label color="secondary">
            <ion-text class="ion-hide-md-down">Points </ion-text>
            <ion-text class="ion-hide-lg-down">Encaissés</ion-text>
            <ion-text class="ion-hide-lg-up">
              <ion-icon name="remove-outline"></ion-icon>
            </ion-text>
          </ion-label>
        </ion-col>
      </ion-row>
    );
  }

  private renderGridBody() {
    let counter = 0;
    const gridDatas = this.getTournamentFormatedDatas();
    if (!gridDatas) {
      // TODO display message ?!
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
            color="primary"
            type={this.tournament?.type}
            tournamentGridId={gridData?.tournamentGridId}
            onMadSelectChange={(ev: CustomEvent<GridTeamOnUpdateDetail>) => this.onTeamTeamChange(ev.detail)}
            placeholder="Équipe vide"
          ></mad-select-team>
        </ion-col>
        <ion-col>
          <ion-label color="primary">{(gridData?.winGames || 0) + (gridData?.looseGames || 0)}</ion-label>
        </ion-col>
        <ion-col>
          <mad-input-number readonly value={gridData?.winGames} color="success" min={this.conf.winGamesMin} placeholder="0"></mad-input-number>
        </ion-col>
        <ion-col>
          <mad-input-number readonly value={gridData?.looseGames} color="secondary" min={this.conf.looseGamesMin} placeholder="0"></mad-input-number>
        </ion-col>
        <ion-col>
          <mad-input-number readonly value={gridData?.winGamesPercent} color="primary" min={this.conf.winGamesPercentMin} placeholder="0"></mad-input-number>
        </ion-col>
        <ion-col>
          <mad-input-number readonly value={gridData?.scoredPoints} color="success" min={this.conf.scoredPointsMin} placeholder="0"></mad-input-number>
        </ion-col>
        <ion-col>
          <mad-input-number readonly value={gridData?.concededPoints} color="secondary" min={this.conf.scoredPointsMin} placeholder="0"></mad-input-number>
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
