import { Component, Element, Host, h, Prop, State } from "@stencil/core";
import Matchs, {
  Match,
  MatchStatus,
  MatchTeamType,
  type Row,
} from "../../modules/matchs/matchs";
import type { TeamRow } from "../../modules/team-row/team-row";
import tournaments, {
  Tournaments,
} from "../../modules/tournaments/tournaments";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";
import uuid from "../../modules/uuid/uuid";

type Config = {
  minGoal: number;
};

type ScrollConfig = {
  matchThreshold: number;
  scrollDelay: number;
};

@Component({
  tag: "page-match",
  styleUrl: "page-match.css",
  shadow: false,
})
export class PageMatch {
  private readonly tournaments: typeof tournaments;
  private readonly config: Config;
  private readonly SCROLL_CONFIG: ScrollConfig;

  @Prop() public tournamentId: number;

  @Element() host: HTMLElement;

  @State() private tournament: Tournament | null;
  @State() private uiError: string | null;
  @State() private displayTeamSelector: boolean;
  @State() private teamToSelect: Row[] | null;
  @State() private matchNumber: number;
  @State() private currentMatch: Match | null;
  @State() private refreshUIHook: number;
  @State() private matchRefs: HTMLElement[] = [];
  @State() private rankMap: Map<number, number> = new Map();

  constructor() {
    this.tournaments = tournaments;

    this.uiError = null;
    this.displayTeamSelector = false;
    this.currentMatch = null;
    this.config = {
      minGoal: 0,
    };

    this.SCROLL_CONFIG = {
      matchThreshold: 10,
      scrollDelay: 1000,
    };

    this.initTournaments();
    this.refreshUI();
  }

  componentWillLoad() {
    this.tournaments.onUpdate(() => this.updateRankMap());
    this.updateRankMap();
  }

  get targetMatchIndex(): number | null {
    if (
      !this.tournament?.matchs ||
      this.tournament.matchs.length <= this.SCROLL_CONFIG.matchThreshold
    ) {
      return null;
    }
    const doingIndex = this.tournament.matchs.findIndex(
      (match) => match.status === MatchStatus.DOING
    );
    if (doingIndex !== -1) {
      return doingIndex;
    }

    return this.tournament.matchs.length - 1;
  }

  private autoScrollToMatch(retryCount = 0): void {
    const targetIndex = this.targetMatchIndex;
    if (targetIndex === null) {
      return;
    }

    if (!this.matchRefs[targetIndex]) {
      if (retryCount < 10) {
        requestAnimationFrame(() => this.autoScrollToMatch(retryCount + 1));
        return;
      }

      return;
    }

    setTimeout(() => {
      this.matchRefs[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, this.SCROLL_CONFIG.scrollDelay);
  }

  componentDidLoad() {}

  private async initTournaments(): Promise<number> {
    this.tournament = await this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return 0;
    }

    this.matchNumber = this.tournament.matchs.length;

    this.autoScrollToMatch();
    return this.updateTournament();
  }

  async updateTournament(): Promise<number> {
    if (!this.tournament) {
      return 0;
    }

    return this.tournaments.update(this.tournament);
  }

  public onTeamChange(
    detail: { value: string },
    team: TeamRow,
    key: string
  ): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  private goMatch() {
    this.displayTeamSelector = true;
    this.currentMatch = new Match();

    if (this.tournament) {
      this.teamToSelect = Matchs.teamSortedByMatch(this.tournament);
    }

    this.resetRowStates();
  }

  private refreshUI() {
    // Change ref
    this.teamToSelect = this.teamToSelect?.map((row) => row) || null;
    this.refreshUIHook = uuid.new();
  }

  private resetRowStates() {
    this.teamToSelect?.forEach((row) => {
      row.selected = false;
    });
  }

  private cleanRowStates() {
    this.teamToSelect?.forEach((row) => {
      if (
        row.team.id !== this.currentMatch?.hostId &&
        row.team.id !== this.currentMatch?.visitorId
      ) {
        row.selected = false;
      }
    });
  }

  private onTeamSelected(row: Row) {
    row.selected = !row.selected;

    if (!this.currentMatch) {
      return;
    }

    if (row.selected) {
      if (this.currentMatch.hostId) {
        this.currentMatch.visitorId = row.team.id;
      } else {
        this.currentMatch.hostId = row.team.id;
      }

      this.cleanRowStates();
    } else if (this.currentMatch.hostId === row.team.id) {
      this.currentMatch.hostId = null;
    } else {
      this.currentMatch.visitorId = null;
    }

    this.refreshUI();
  }

  private async deleteMatch(match: Match) {
    const response = await Utils.confirmChoice("Supprimer le match ?");

    if (!(this.tournament?.matchs && response)) {
      return;
    }

    for (let i = 0, imax = this.tournament.matchs.length; i < imax; i++) {
      if (
        !this.tournament.matchs[i].id ||
        this.tournament.matchs[i].id === match.id
      ) {
        this.tournament.matchs.splice(i, 1);
        break;
      }
    }

    this.matchNumber = this.tournament.matchs.length;

    this.updateTournament();
    this.refreshUI();
  }

  private goValidateSelection() {
    if (!this.tournament) {
      return;
    }

    if (!this.tournament.matchs) {
      this.tournament.matchs = [];
    }

    if (this.currentMatch) {
      this.tournament.matchs.push(this.currentMatch);
    }

    this.matchNumber = this.tournament.matchs.length;
    this.updateTournament();

    this.displayTeamSelector = false;
    this.currentMatch = null;
  }

  private cancelSelection() {
    this.displayTeamSelector = false;
    this.currentMatch = null;
  }

  private onTeamScores(
    match: Match,
    teamType: MatchTeamType,
    detail: { value: string }
  ) {
    const value = Number(detail.value);
    if (teamType === MatchTeamType.VISITOR) {
      match.goals.visitor = value;
    } else {
      match.goals.host = value;
    }

    this.updateTournament();
    this.refreshUI();
  }

  private async getTeam(teamId: number | null): Promise<TeamRow | null> {
    if (!this.tournament) {
      return Promise.resolve(null);
    }

    return this.tournaments.getTournamentTeam(this.tournament, teamId);
  }

  private playMatch(match: Match) {
    match.status = MatchStatus.DOING;
    this.updateTournament();
    this.refreshUI();
  }

  private stopMatch(match: Match) {
    match.status = MatchStatus.DONE;
    this.updateTournament();
    this.refreshUI();
  }

  private renderActionButtons(match: Match) {
    return (
      <div class="columns-2 content-center gap-8 py-4">
        <sl-button
          class="w-full"
          onclick={() => this.deleteMatch(match)}
          size="large"
          variant="warning"
        >
          <sl-icon name="trash" />
        </sl-button>

        {match.status === MatchStatus.DOING ? (
          <sl-button
            class="w-full"
            onclick={() => this.stopMatch(match)}
            size="large"
            variant="primary"
          >
            <sl-icon name="stop-circle" />
          </sl-button>
        ) : (
          <sl-button
            class="w-full"
            onClick={() => this.playMatch(match)}
            size="large"
            variant="primary"
          >
            <sl-icon name="play-circle" />
          </sl-button>
        )}
      </div>
    );
  }

  private updateRankMap(): void {
    const sortedGrid = Tournaments.sortGrid(this.tournament?.grid || []);
    this.rankMap = new Map<number, number>();
    sortedGrid.forEach((team, index) => this.rankMap.set(team.id, index + 1));
  }

  render() {
    this.updateRankMap();

    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon class="text-2xl" name="house" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item href="#/tournaments">
            <sl-icon class="text-2xl" name="trophy" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item href={`#/tournament/${this.tournament?.id}`}>
            <sl-icon class="text-2xl" name="card-list" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="controller" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          {this.uiError ? (
            <error-message message={this.uiError} />
          ) : (
            <div>
              <h1>{this.tournament?.name}</h1>
              <h2>Match(s)</h2>

              {this.matchNumber > 0 && !this.displayTeamSelector ? (
                <div class="grid grid-cols-1 gap-4">
                  <div class="block-primary grid grid-cols-5 items-center py-2">
                    <div class="col-span-2">Locaux</div>
                    <div class="text-2xl">
                      {this.tournament?.type === TournamentType.NBA
                        ? TournamentTypeLabel.NBA
                        : null}
                      {this.tournament?.type === TournamentType.NFL
                        ? TournamentTypeLabel.NFL
                        : null}
                      {this.tournament?.type === TournamentType.FOOT
                        ? TournamentTypeLabel.FOOT
                        : null}
                      {this.tournament?.type === TournamentType.RUGBY
                        ? TournamentTypeLabel.RUGBY
                        : null}
                      {this.tournament?.type === TournamentType.BASKET
                        ? TournamentTypeLabel.BASKET
                        : null}
                    </div>
                    <div class="col-span-2">Visiteurs</div>
                  </div>

                  {this.tournament?.matchs.map((match, index) => {
                    const hostRank = match.hostId
                      ? this.rankMap.get(match.hostId)
                      : undefined;
                    const visitorRank = match.visitorId
                      ? this.rankMap.get(match.visitorId)
                      : undefined;

                    return (
                      <div
                        class="rounded border border-sky border-solid px-1 py-4"
                        ref={(el) => {
                          if (el) {
                            this.matchRefs[index] = el;
                          }
                        }}
                      >
                        <div>
                          {match.status === MatchStatus.PENDING && (
                            <sl-tag variant="primary">
                              <span class="container">Match programmé</span>
                              <sl-icon
                                class="text-3xl text-primary"
                                name="calendar-check"
                              />
                            </sl-tag>
                          )}
                          {match.status === MatchStatus.DOING && (
                            <sl-tag variant="success">
                              <span class="container">Match en cours</span>
                              <sl-spinner class="text-2xl" />
                            </sl-tag>
                          )}
                          {match.status === MatchStatus.DONE && (
                            <sl-tag variant="warning">
                              <span class="container">Match terminé</span>
                              <sl-icon
                                class="text-3xl text-warning"
                                name="check2-square"
                              />
                            </sl-tag>
                          )}
                        </div>

                        {this.refreshUIHook ? (
                          <mad-match-tile
                            hostPending={this.getTeam(match.hostId)}
                            hostRank={hostRank}
                            hostScore={match.goals.host}
                            visitorPending={this.getTeam(match.visitorId)}
                            visitorRank={visitorRank}
                            visitorScore={match.goals.visitor}
                          />
                        ) : null}

                        <div class="grid grid-cols-2 gap-4">
                          {(this.tournament?.type === TournamentType.NBA ||
                            this.tournament?.type ===
                              TournamentType.BASKET) && (
                            <mad-scorer-basket
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.HOST,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.host}
                            />
                          )}

                          {(this.tournament?.type === TournamentType.FOOT ||
                            !this.tournament?.type) && (
                            <mad-scorer-common
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.HOST,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.host}
                            />
                          )}

                          {this.tournament?.type === TournamentType.NFL && (
                            <mad-scorer-rugby
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.HOST,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.host}
                            />
                          )}

                          {this.tournament?.type === TournamentType.RUGBY && (
                            <mad-scorer-rugby
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.HOST,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.host}
                            />
                          )}

                          {(this.tournament?.type === TournamentType.NBA ||
                            this.tournament?.type ===
                              TournamentType.BASKET) && (
                            <mad-scorer-basket
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.VISITOR,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.visitor}
                            />
                          )}

                          {this.tournament?.type === TournamentType.FOOT && (
                            <mad-scorer-common
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.VISITOR,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.visitor}
                            />
                          )}

                          {this.tournament?.type === TournamentType.NFL && (
                            <mad-scorer-rugby
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.VISITOR,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.visitor}
                            />
                          )}

                          {this.tournament?.type === TournamentType.RUGBY && (
                            <mad-scorer-rugby
                              min={this.config.minGoal}
                              onMadNumberChange={(ev: CustomEvent) =>
                                this.onTeamScores(
                                  match,
                                  MatchTeamType.VISITOR,
                                  ev.detail
                                )
                              }
                              readonly={match.status !== MatchStatus.DOING}
                              value={match.goals.visitor}
                            />
                          )}
                        </div>

                        {this.refreshUIHook
                          ? this.renderActionButtons(match)
                          : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  {this.displayTeamSelector ? null : (
                    <h2>
                      <span class="text-warning"> Aucun match en cours </span>
                    </h2>
                  )}
                </div>
              )}

              {this.displayTeamSelector ? (
                <div>
                  <h3>Équipes sélectionnées:</h3>
                  <mad-match-tile
                    hostPending={this.getTeam(
                      this.currentMatch?.hostId || null
                    )}
                    visitorPending={this.getTeam(
                      this.currentMatch?.visitorId || null
                    )}
                  />

                  <div class="w-fill overflow-x-auto">
                    <table class="table-auto">
                      <thead class="block-primary">
                        <tr>
                          <th>
                            <sl-icon class="text-2xl" name="list-check" />
                          </th>
                          <th>
                            <span>Équipes</span>
                          </th>
                          <th>
                            <span>Matchs </span>
                            <span>Total </span>
                          </th>
                          <th>
                            <span>Matchs </span>
                            <span>Joués </span>
                          </th>
                          <th>
                            <span>Matchs </span>
                            <span>Programmés </span>
                          </th>
                        </tr>
                      </thead>

                      {this.teamToSelect?.map((row) => (
                        <tr
                          class="cursor-pointer items-center"
                          onClick={() => this.onTeamSelected(row)}
                        >
                          <td>
                            {row.selected ? (
                              <sl-icon
                                class="text-2xl text-success"
                                name="check-square"
                              />
                            ) : (
                              <sl-icon
                                class="text-2xl text-success"
                                name="square"
                              />
                            )}
                          </td>
                          <td>
                            <mad-team-tile team={row.team.team} />
                          </td>
                          <td>{row.totalMatchs}</td>
                          <td>{row.doneMatchs}</td>
                          <td>{row.scheduledMatchs}</td>
                        </tr>
                      ))}
                    </table>
                  </div>

                  <div class="footer">
                    <div class="grid-300">
                      <sl-button
                        onclick={() => this.cancelSelection()}
                        size="large"
                        variant="warning"
                      >
                        <sl-icon name="ban" slot="prefix" />
                        <span slot="suffix">Annuler</span>
                      </sl-button>
                      <sl-button
                        disabled={Boolean(
                          this.currentMatch &&
                            !(
                              this.currentMatch.visitorId &&
                              this.currentMatch.hostId
                            )
                        )}
                        onclick={() => this.goValidateSelection()}
                        size="large"
                        variant="primary"
                      >
                        <span slot="prefix">Valider</span>
                        <sl-icon name="arrow-right" slot="suffix" />
                      </sl-button>
                    </div>
                  </div>
                </div>
              ) : (
                <div class="footer">
                  <div class="grid-300">
                    <sl-button
                      onclick={() => this.goMatch()}
                      size="large"
                      variant="primary"
                    >
                      <sl-icon name="plus-lg" slot="prefix" />
                      <span slot="suffix">Nouveau match</span>
                    </sl-button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
