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
import { getTournaments } from "../../modules/init";
import TeamRow from "../../modules/team-row/team-row";
import theSportsDbService from "../../modules/thesportsdb/thesportsdb.service";
import type {
  Tournament,
  TournamentType,
  TournamentUpdateEvent,
} from "../../modules/tournaments/tournaments.types";

import "../action-bar/action-bar"; // Register custom element

@Component({
  tag: "grid-basket",
  styleUrl: "grid-basket.css",
  shadow: false,
})
export class GridBasket {
  // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
  private readonly tournaments = getTournaments();

  @State() private tournament: Tournament | null;

  @State() private isLoadingNbaTeams = false;

  @State() private magicFillError: string | null = null;

  @Prop() tournamentId: number | null;

  @Event() gridTournamentChange: EventEmitter<TournamentUpdateEvent>;

  constructor() {
    this.tournament = null;
    this.tournamentId = null;

    // Migration: tournaments instance is now obtained via field initializer (getTournaments)

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

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private async magicFillUpNbaTeams(): Promise<void> {
    if (!this.tournament || this.tournament.type !== "NBA") {
      return;
    }

    this.isLoadingNbaTeams = true;
    this.magicFillError = null;

    try {
      // Fetch all 30 NBA teams
      const allNbaTeams = await theSportsDbService.getAllNbaTeams();

      // Remove duplicates from current grid
      const seenIds = new Set<number>();
      const uniqueGrid: TeamRow[] = [];

      for (const row of this.tournament.grid) {
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
          type: this.tournament.type as TournamentType,
        });
        // biome-ignore lint/style/noNonNullAssertion: Safe - checked in while condition
        newRow.team = shuffled.pop()!;
        newGrid.push(newRow);
      }

      // Update tournament
      this.tournament.grid = newGrid;
      await this.tournaments.update(this.tournament);
      this.updateTournament();
    } catch (error) {
      this.magicFillError = "Failed to load NBA teams";
      console.error(error);
    } finally {
      this.isLoadingNbaTeams = false;
    }
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
        <th class="text-center">
          <sl-icon class="inline-block text-2xl" name="calendar-event" />
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
        <td class="text-center">
          <span class="text-primary">{gridData?.scheduledMatchs}</span>
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
              <span class="mx-1">
                <sl-icon name="calendar-event" />: match programmés
              </span>
            </div>
          </caption>
          {this.renderGridHeader()}

          {this.tournament && this.renderGridBody()}
        </table>
        {this.tournament?.type === "NBA" && (
          <action-bar>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: sl-button is a Shoelace web component */}
            <sl-button
              loading={this.isLoadingNbaTeams}
              onClick={() => this.magicFillUpNbaTeams()}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this.magicFillUpNbaTeams();
                }
              }}
              size="medium"
              variant="primary"
            >
              <sl-icon name="magic" slot="prefix" />
              Magic fill-up
            </sl-button>
            {this.magicFillError && (
              <span class="text-danger text-sm">{this.magicFillError}</span>
            )}
          </action-bar>
        )}
      </Host>
    );
  }
}
