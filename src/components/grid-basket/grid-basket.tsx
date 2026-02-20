import {
  Component,
  Event,
  type EventEmitter,
  Host,
  h,
  Prop,
  State,
} from "@stencil/core";
import Basket from "../../modules/data-basket/data-basket";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types";
import tournaments from "../../modules/tournaments/tournaments";
import type {
  Tournament,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types";

@Component({
  tag: "grid-basket",
  styleUrl: "grid-basket.css",
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
    const gridRaw = this.tournament?.grid.find(
      (grid) => grid.id === detail.tournamentGridId
    );

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
          <sl-icon class="text-2xl" name="sort-numeric-down" />
        </th>
        <th>
          <span>Équipes</span>
        </th>
        <th>
          <span class="block text-xl">
            <sl-icon name="percent" />
          </span>
        </th>
        <th>
          <span class="block md:hidden">J</span>
          <span class="hidden md:block">Joués</span>
        </th>
        <th>
          <span class="block text-success md:hidden">G</span>
          <span class="hidden text-success md:block">Gagnés</span>
        </th>
        <th>
          <span class="block text-warning md:hidden">P</span>
          <span class="hidden text-warning md:block">Perdus</span>
        </th>
        <th>
          <span class="block text-success text-xl md:hidden">
            <sl-icon name="plus-lg" />
          </span>
          <span class="hidden text-success md:block">Marqués</span>
        </th>
        <th>
          <span class="block text-warning text-xl md:hidden">
            <sl-icon name="dash-lg" />
          </span>
          <span class="hidden text-warning md:block">Encaissés</span>
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

    return gridDatas.map((gridData) => (
      <tr class="">
        <td>
          <span class="counter">
            {counter > 8 ? null : "0"}
            {++counter}
          </span>
        </td>
        <td>
          <mad-select-team
            color="dark"
            onMadSelectChange={(ev: CustomEvent<GridTeamOnUpdateDetail>) =>
              this.onTeamTeamChange(ev.detail)
            }
            placeholder="Équipe vide"
            tournamentGridId={gridData?.tournamentGridId}
            type={this.tournament?.type}
            value={gridData?.team}
          />
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
            <div class="text-wrap text-left text-neutral text-xs">
              <span class="mx-1 text-primary">
                <sl-icon name="percent" />: pourcentage de match gagnés.
              </span>
              <span class="mx-1">J: total de match joués</span>
              <span class="mx-1 text-success">G: match gagnés</span>
              <span class="mx-1 text-warning">P: match perdus</span>
              <span class="mx-1 text-success">
                <sl-icon name="plus-lg" />: points marqués
              </span>
              <span class="mx-1 text-warning">
                <sl-icon name="dash-lg" />: points encaissés
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
