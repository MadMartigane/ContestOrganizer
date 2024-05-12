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
      <thead class="block-primary align-middle">
        <th>
          <sl-icon name="sort-numeric-down" class="text-2xl"></sl-icon>
        </th>
        <th>
          <span>Équipes</span>
        </th>
        <th>
          <span class="block text-xl">
            <sl-icon name="percent"></sl-icon>
          </span>
        </th>
        <th>
          <span class="block md:hidden">J</span>
          <span class="hidden md:block">Joués</span>
        </th>
        <th>
          <span class="block md:hidden text-success">G</span>
          <span class="hidden md:block text-success">Gagnés</span>
        </th>
        <th>
          <span class="block md:hidden text-warning">P</span>
          <span class="hidden md:block text-warning">Perdus</span>
        </th>
        <th>
          <span class="block md:hidden text-success text-xl">
            <sl-icon name="plus-lg"></sl-icon>
          </span>
          <span class="hidden md:block text-success">Marqués</span>
        </th>
        <th>
          <span class="block md:hidden text-warning text-xl">
            <sl-icon name="dash-lg"></sl-icon>
          </span>
          <span class="hidden md:block text-warning">Encaissés</span>
        </th>
      </thead>
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
      <tr class="">
        <td>
          <span class="counter">
            {counter > 8 ? null : '0'}
            {++counter}
          </span>
        </td>
        <td>
          <mad-select-team
            value={gridData?.team}
            color="dark"
            type={this.tournament?.type}
            tournamentGridId={gridData?.tournamentGridId}
            onMadSelectChange={(ev: CustomEvent<GridTeamOnUpdateDetail>) => this.onTeamTeamChange(ev.detail)}
            placeholder="Équipe vide"
          ></mad-select-team>
        </td>
        <td>
          <span class="text-primary">{gridData?.winGamesPercent}</span>
        </td>
        <td>
          <span>{(gridData?.winGames || 0) + (gridData?.looseGames || 0)}</span>
        </td>
        <td>
          <span class="text-success">{gridData?.winGames}</span>
        </td>
        <td>
          <span class="text-warning">{gridData?.looseGames}</span>
        </td>
        <td>
          <span class="text-success">{gridData?.scoredPoints}</span>
        </td>
        <td>
          <span class="text-warning">{gridData?.concededPoints}</span>
        </td>
      </tr>
    ));
  }

  render() {
    return (
      <Host>
        <table class="my-6">
          <caption class="caption-bottom md:hidden">
            <div class="text-neutral text-xs text-left text-wrap">
              <span class="text-primary mx-1">
                <sl-icon name="percent"></sl-icon>: pourcentage de match gagnés.
              </span>
              <span class="mx-1">J: total de match joués</span>
              <span class="text-success mx-1">G: match gagnés</span>
              <span class="text-warning mx-1">P: match perdus</span>
              <span class="text-success mx-1">
                <sl-icon name="plus-lg"></sl-icon>: points marqués
              </span>
              <span class="text-warning mx-1">
                <sl-icon name="dash-lg"></sl-icon>: points encaissés
              </span>
            </div>
          </caption>
          {this.renderGridHeader()}

          {this.tournament && this.renderGridBody()}
        </table>
      </Host>
    );
  }
}
