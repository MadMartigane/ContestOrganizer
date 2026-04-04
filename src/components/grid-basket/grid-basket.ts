import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import Basket from "../../modules/data-basket/data-basket.js";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types.js";
import { getTournaments } from "../../modules/init.js";
import TeamRow from "../../modules/team-row/team-row.js";
import theSportsDbService from "../../modules/thesportsdb/thesportsdb.service.js";
import type {
  Tournament,
  TournamentType,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types.js";

/**
 * GridBasket - Displays basketball/NBA tournament grid with team selections
 * @element grid-basket
 */
export class GridBasket extends BaseElement {
  private readonly _tournaments = getTournaments();
  private declare _tournament: Signal<Tournament | null>;
  private declare _isLoadingNbaTeams: Signal<boolean>;
  private _tournamentUpdateHandler: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return ["tournament-id"];
  }

  protected _setupProperties(): void {
    this._tournament = new Signal<Tournament | null>(null);
    this._isLoadingNbaTeams = new Signal<boolean>(false);
    this._trackSignal(this._tournament);
    this._trackSignal(this._isLoadingNbaTeams);

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

  private getTournamentFormatedDatas() {
    const tournament = this._tournament.value;
    if (!tournament) {
      return null;
    }

    return Basket.data(tournament);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async magicFillUpNbaTeams(): Promise<void> {
    const tournament = this._tournament.value;
    if (!tournament || tournament.type !== "NBA") {
      return;
    }

    this._isLoadingNbaTeams.value = true;

    try {
      // Fetch all 30 NBA teams
      const allNbaTeams = await theSportsDbService.getAllNbaTeams();

      // Remove duplicates from current grid
      const seenIds = new Set<number>();
      const uniqueGrid: TeamRow[] = [];

      for (const row of tournament.grid) {
        if (row.team?.id) {
          if (!seenIds.has(row.team.id)) {
            seenIds.add(row.team.id);
            uniqueGrid.push(row);
          }
          // Duplicates are skipped (removed)
        } else {
          uniqueGrid.push(row); // Keep empty slots
        }
      }

      // Get missing teams
      const missingTeams = allNbaTeams.filter((t) => !seenIds.has(t.id));

      // Shuffle using Fisher-Yates
      const shuffled = this.shuffleArray([...missingTeams]);

      // Fill empty slots first
      const newGrid = [...uniqueGrid];
      for (let i = 0; i < newGrid.length && shuffled.length > 0; i++) {
        if (!newGrid[i].team) {
          // biome-ignore lint/style/noNonNullAssertion: Safe - checked in loop condition
          newGrid[i].team = shuffled.pop()!;
        }
      }

      // Add remaining teams as new rows
      while (shuffled.length > 0) {
        const newRow = new TeamRow({
          type: tournament.type as TournamentType,
        });
        // biome-ignore lint/style/noNonNullAssertion: Safe - checked in while condition
        newRow.team = shuffled.pop()!;
        newGrid.push(newRow);
      }

      // Update tournament
      tournament.grid = newGrid;
      this._tournament.value = { ...tournament };
      await this._tournaments.update(tournament);
      this.updateTournament();
    } catch (error) {
      console.error(error);
    } finally {
      this._isLoadingNbaTeams.value = false;
    }
  }

  private _renderGridHeader(): string {
    return `
      <thead class="bg-orange-600 text-neutral-100 dark:bg-orange-700 dark:text-neutral-50 align-middle">
        <th>
          <mad-icon class="text-2xl" name="sort-numeric-down"></mad-icon>
        </th>
        <th>
          <span>Équipes</span>
        </th>
        <th>
          <span class="block text-xl">
            <mad-icon name="percent"></mad-icon>
          </span>
        </th>
        <th>
          <span class="block md:hidden">J</span>
          <span class="hidden md:block">Joués</span>
        </th>
        <th>
          <span class="block text-green-600 md:hidden">G</span>
          <span class="hidden text-green-600 md:block">Gagnés</span>
        </th>
        <th>
          <span class="block text-yellow-600 md:hidden">P</span>
          <span class="hidden text-yellow-600 md:block">Perdus</span>
        </th>
        <th>
          <span class="block text-green-600 text-xl md:hidden">
            <mad-icon name="plus"></mad-icon>
          </span>
          <span class="hidden text-green-600 md:block">Marqués</span>
        </th>
        <th>
          <span class="block text-yellow-600 text-xl md:hidden">
            <mad-icon name="minus"></mad-icon>
          </span>
          <span class="hidden text-yellow-600 md:block">Encaissés</span>
        </th>
        <th class="text-center">
          <mad-icon class="inline-block text-2xl" name="calendar-event"></mad-icon>
        </th>
      </thead>
    `;
  }

  private _renderGridBody(): string {
    const gridDatas = this.getTournamentFormatedDatas();
    if (!gridDatas) {
      return "";
    }

    let counter = 0;
    const rows = gridDatas
      .map((gridData) => {
        const rowNumber = ++counter;
        return `
          <tr class="">
            <td>
              <span class="counter">
                ${rowNumber > 9 ? "" : "0"}
                ${rowNumber}
              </span>
            </td>
            <td>
              <mad-select-team
                data-grid-id="${gridData?.tournamentGridId}"
              ></mad-select-team>
            </td>
            <td>
              <span class="text-orange-600">${gridData?.winGamesPercent}</span>
            </td>
            <td>
              <span>${(gridData?.winGames || 0) + (gridData?.looseGames || 0)}</span>
            </td>
            <td>
              <span class="text-green-600">${gridData?.winGames}</span>
            </td>
            <td>
              <span class="text-yellow-600">${gridData?.looseGames}</span>
            </td>
            <td>
              <span class="text-green-600">${gridData?.scoredPoints}</span>
            </td>
            <td>
              <span class="text-yellow-600">${gridData?.concededPoints}</span>
            </td>
            <td class="text-center">
              <span class="text-orange-600">${gridData?.scheduledMatchs}</span>
            </td>
          </tr>
        `;
      })
      .join("");

    return rows;
  }

  protected _render(): void {
    const tournament = this._tournament.value;

    this.innerHTML = `
      <table class="my-6">
        <caption class="caption-bottom md:hidden">
          <div class="text-wrap text-left text-neutral-400 text-xs">
            <span class="mx-1 text-orange-600">
              <mad-icon name="percent"></mad-icon>: pourcentage de match gagnés.
            </span>
            <span class="mx-1">J: total de match joués</span>
            <span class="mx-1 text-green-600">G: match gagnés</span>
            <span class="mx-1 text-yellow-600">P: match perdus</span>
            <span class="mx-1 text-green-600">
              <mad-icon name="plus"></mad-icon>: points marqués
            </span>
            <span class="mx-1 text-yellow-600">
              <mad-icon name="minus"></mad-icon>: points encaissés
            </span>
            <span class="mx-1">
              <mad-icon name="calendar-event"></mad-icon>: match programmés
            </span>
          </div>
        </caption>
        ${this._renderGridHeader()}
        <tbody>
          ${tournament ? this._renderGridBody() : ""}
        </tbody>
      </table>
    `;

    // Two-pass rendering: setup mad-select-team elements
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
        element.setAttribute("color", "dark");
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

customElements.define("grid-basket", GridBasket);
