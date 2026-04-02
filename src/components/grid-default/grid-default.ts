import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types.js";
import { getTournaments } from "../../modules/init.js";
import type {
  Tournament,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types.js";

/**
 * GridDefault - Displays tournament grid with team selections
 * @element grid-default
 */
export class GridDefault extends BaseElement {
  private readonly _tournaments = getTournaments();
  private declare _tournament: Signal<Tournament | null>;
  private _tournamentUpdateHandler: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return ["tournament-id"];
  }

  protected _setupProperties(): void {
    this._tournament = new Signal<Tournament | null>(null);
    this._trackSignal(this._tournament);

    this._initialized = true;
  }

  protected _createRenderRoot(): Element {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._tournamentUpdateHandler = () => {
      this.forceGridRender();
    };
    this._tournaments.onUpdate(this._tournamentUpdateHandler);
    this.forceGridRender();
  }

  disconnectedCallback(): void {
    this._tournamentUpdateHandler = null;
    super.disconnectedCallback();
  }

  protected _onAttributeChange(name: string, _value: string | null): void {
    if (name === "tournament-id") {
      this.forceGridRender();
    }
  }

  private async forceGridRender(): Promise<void> {
    const tournamentIdStr = this.getAttribute("tournament-id");
    const tournamentId =
      tournamentIdStr === null ? null : Number(tournamentIdStr);

    this._tournament.value = null;
    this._tournament.value = await this._tournaments.get(tournamentId);
  }

  private updateTournament(): void {
    const tournament = this._tournament.value;
    if (tournament) {
      this._emit<TournamentUpdateEvent>("gridTournamentChange", {
        tournamentId: tournament.id,
      });
    }
  }

  private async onTeamTeamChange(
    detail: GridTeamOnUpdateDetail
  ): Promise<void> {
    const tournament = this._tournament.value;
    if (!tournament) {
      return;
    }

    const gridRaw = tournament.grid.find(
      (grid) => grid.id === detail.tournamentGridId
    );

    if (gridRaw) {
      gridRaw.team = detail.genericTeam;
    }

    await this._tournaments.update(tournament);
    this.updateTournament();
  }

  protected _render(): void {
    const tournament = this._tournament.value;
    const rows = tournament?.grid ?? [];

    let counter = 0;
    const tableRows = rows
      .map((gridRow) => {
        const rowNumber = ++counter;
        return `
          <tr>
            <td>
              <span class="counter">
                ${rowNumber > 9 ? null : "0"}
                ${rowNumber}
              </span>
            </td>
            <td>
              <mad-select-team
                data-grid-id="${gridRow.id}"
              ></mad-select-team>
            </td>
            <td>
              <span class="text-primary">${gridRow.points}</span>
            </td>
            <td>
              <span class="text-success">${gridRow.scoredGoals}</span>
            </td>
            <td>
              <span class="text-warning">${gridRow.concededGoals}</span>
            </td>
            <td>
              <span class="text-primary">${gridRow.goalAverage}</span>
            </td>
            <td class="text-center">
              <span class="text-primary">${gridRow.scheduledMatchs}</span>
            </td>
          </tr>
        `;
      })
      .join("");

    this.innerHTML = `
      <table class="table-auto">
        <thead class="block-primary align-middle">
          <th>
            <wa-icon class="text-2xl" name="sort-numeric-down"></wa-icon>
          </th>
          <th>
            <span>Équipes</span>
          </th>
          <th>
            <span>Points</span>
          </th>
          <th>
            <span class="text-success">Buts</span>
            <wa-icon class="text-2xl text-success" name="plus"></wa-icon>
          </th>
          <th>
            <span class="text-warning">Buts</span>
            <wa-icon class="text-2xl text-warning" name="minus"></wa-icon>
          </th>
          <th>
            <span>Goal average</span>
          </th>
          <th class="text-center">
            <wa-icon class="inline-block text-2xl" name="calendar-event"></wa-icon>
          </th>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    this._setupTeamSelectors();
  }

  private _setupTeamSelectors(): void {
    const tournament = this._tournament.value;
    const selectors = Array.from(this.querySelectorAll("mad-select-team"));

    for (const selector of selectors) {
      const gridIdStr = selector.getAttribute("data-grid-id");
      if (!gridIdStr) {
        continue;
      }

      const gridId = Number(gridIdStr);
      const gridRow = tournament?.grid.find((g) => g.id === gridId);

      if (gridRow && selector) {
        const element = selector as HTMLElement;
        element.setAttribute("tournament-grid-id", String(gridId));
        element.setAttribute("color", "primary");
        element.setAttribute("placeholder", "Équipe vide");
        if (tournament?.type) {
          element.setAttribute("type", tournament.type);
        }
        if (gridRow.team) {
          element.setAttribute("value", JSON.stringify(gridRow.team));
        }

        selector.addEventListener(
          "madSelectChange",
          (ev: CustomEvent<GridTeamOnUpdateDetail>) => {
            this.onTeamTeamChange(ev.detail);
          }
        );
      }
    }
  }
}

customElements.define("grid-default", GridDefault);
