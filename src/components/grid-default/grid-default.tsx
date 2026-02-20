import {
  Component,
  Event,
  type EventEmitter,
  Host,
  h,
  Prop,
  State,
} from "@stencil/core";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types";
import tournaments from "../../modules/tournaments/tournaments";
import type {
  Tournament,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types";

@Component({
  tag: "grid-default",
  styleUrl: "grid-default.css",
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
    const gridRaw = this.tournament?.grid.find(
      (grid) => grid.id === detail.tournamentGridId
    );

    if (gridRaw) {
      gridRaw.team = detail.genericTeam;
    }

    this.updateTournament();
  }

  render() {
    return (
      <Host>
        <table class="table-auto">
          <thead class="block-primary align-middle">
            <th>
              <sl-icon class="text-2xl" name="sort-numeric-down" />
            </th>
            <th>
              <span>Équipes</span>
            </th>
            <th>
              <span>Points</span>
            </th>
            <th>
              <span class="text-success">Buts</span>
              <sl-icon class="text-2xl text-success" name="plus-lg" />
            </th>
            <th>
              <span class="text-warning">Buts</span>
              <sl-icon class="text-2xl text-warning" name="dash-lg" />
            </th>
            <th>
              <span>Goal average</span>
            </th>
          </thead>

          {this.tournament?.grid.map((gridRow) => (
            <tr class="">
              <td>
                <span class="counter">
                  {this.counter > 8 ? null : "0"}
                  {++this.counter}
                </span>
              </td>
              <td>
                <mad-select-team
                  color="primary"
                  onMadSelectChange={(
                    ev: CustomEvent<GridTeamOnUpdateDetail>
                  ) => this.onTeamTeamChange(ev.detail)}
                  placeholder="Équipe vide"
                  tournamentGridId={gridRow.id}
                  type={this.tournament?.type}
                  value={gridRow.team}
                />
              </td>
              <td>
                <span class="text-primary">{gridRow.points}</span>
              </td>
              <td>
                <span class="text-success">{gridRow.scoredGoals}</span>
              </td>
              <td>
                <span class="text-warning">{gridRow.concededGoals}</span>
              </td>
              <td>
                <span class="text-primary">{gridRow.goalAverage}</span>
              </td>
            </tr>
          ))}
        </table>
      </Host>
    );
  }
}
