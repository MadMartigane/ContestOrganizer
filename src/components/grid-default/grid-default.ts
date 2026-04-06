import { BaseElement } from "@core/base-element";
import { Signal } from "@core/signal";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import type { GridTeamOnUpdateDetail } from "../../modules/grid-common/grid-common.types";
import { getTournaments } from "../../modules/init";
import type {
  Tournament,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types";

/**
 * GridDefault - Displays tournament grid with team selections
 * @element grid-default
 */
export class GridDefault extends BaseElement {
  private readonly _tournaments = getTournaments();
  private declare _tournament: Signal<Tournament | null>;
  private _tournamentUpdateHandler: (() => void) | null = null;
  private _tournamentUnsubscribe: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return ["tournament-id"];
  }

  protected _setupProperties(): void {
    this._tournament = new Signal<Tournament | null>(null);
    this._trackSignal(this._tournament);

    this._initialized = true;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._tournamentUpdateHandler = () => {
      this.forceGridRender();
    };
    this._tournamentUnsubscribe = this._tournaments.onUpdate(
      this._tournamentUpdateHandler
    );
    this.forceGridRender();
  }

  disconnectedCallback(): void {
    if (this._tournamentUnsubscribe) {
      this._tournamentUnsubscribe();
      this._tournamentUnsubscribe = null;
    }
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

  private _renderGridHeader(): ReturnType<typeof html> {
    return html`
      <thead class="bg-orange-600 text-neutral-100 dark:bg-orange-700 dark:text-neutral-50 align-middle">
        <th>
          <mad-icon class="text-2xl" name="sort-numeric-down"></mad-icon>
        </th>
        <th>
          <span>Équipes</span>
        </th>
        <th>
          <span>Points</span>
        </th>
        <th>
          <span class="text-green-600">Buts</span>
          <mad-icon class="text-2xl text-green-600" name="plus"></mad-icon>
        </th>
        <th>
          <span class="text-yellow-600">Buts</span>
          <mad-icon class="text-2xl text-yellow-600" name="minus"></mad-icon>
        </th>
        <th>
          <span>Goal average</span>
        </th>
        <th class="text-center">
          <mad-icon class="inline-block text-2xl" name="calendar-event"></mad-icon>
        </th>
      </thead>
    `;
  }

  private _renderGridBody(): ReturnType<typeof html> {
    const tournament = this._tournament.value;
    const rows = tournament?.grid ?? [];

    if (rows.length === 0) {
      return html``;
    }

    let counter = 0;
    const tableRows = repeat(
      rows,
      (gridRow) => gridRow.id,
      (gridRow) => {
        const rowNumber = ++counter;
        const rowNumberPrefix = rowNumber > 9 ? "" : "0";
        return html`
          <tr>
            <td>
              <span class="counter">${rowNumberPrefix}${rowNumber}</span>
            </td>
            <td>
              <mad-select-team
                data-grid-id="${gridRow.id}"
                tournament-grid-id="${gridRow.id}"
                color="primary"
                placeholder="Équipe vide"
                type="${tournament?.type ?? ""}"
                value="${gridRow.team ? JSON.stringify(gridRow.team) : ""}"
                @mad-select-change=${(
                  ev: CustomEvent<GridTeamOnUpdateDetail>
                ) => {
                  this.onTeamTeamChange(ev.detail);
                }}
              ></mad-select-team>
            </td>
            <td>
              <span class="text-orange-600">${gridRow.points}</span>
            </td>
            <td>
              <span class="text-green-600">${gridRow.scoredGoals}</span>
            </td>
            <td>
              <span class="text-yellow-600">${gridRow.concededGoals}</span>
            </td>
            <td>
              <span class="text-orange-600">${gridRow.goalAverage}</span>
            </td>
            <td class="text-center">
              <span class="text-orange-600">${gridRow.scheduledMatchs}</span>
            </td>
          </tr>
        `;
      }
    );

    return html`<tbody>${tableRows}</tbody>`;
  }

  protected _render(): void {
    this._renderTemplate(html`
      <style>
        .grid-default { display: block; }
      </style>
      <div class="grid-default">
        <div part="base">
          <slot></slot>
          <table class="w-full">
            ${this._renderGridHeader()}
            ${this._renderGridBody()}
          </table>
        </div>
      </div>
    `);
  }
}

customElements.define("grid-default", GridDefault);
