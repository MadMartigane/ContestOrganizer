import { InputChangeEventDetail } from '@ionic/core';
import { Component, h, Host, Prop, State } from '@stencil/core';
import { TeamRow } from '../../modules/team-row/team-row';
import tournaments from '../../modules/tournaments/tournaments';
import Matchs, { Match, MatchTeamType, MatchStatus, Row } from '../../modules/matchs/matchs';
import { Tournament, TournamentType } from '../../modules/tournaments/tournaments.types';
import Utils from '../../modules/utils/utils';
import { MadInputNumberCustomEvent } from '../../components';
import uuid from '../../modules/uuid/uuid';

type Config = {
  minGoal: number;
};

@Component({
  tag: 'page-match',
  styleUrl: 'page-match.css',
  shadow: false,
})
export class PageMatch {
  private readonly tournaments: typeof tournaments;
  private readonly config: Config;

  @Prop() public tournamentId: number;

  @State() private tournament: Tournament | null;
  @State() private uiError: string | null;
  @State() private displayTeamSelector: boolean;
  @State() private teamToSelect: Row[] | null;
  @State() private matchNumber: number;
  @State() private currentMatch: Match | null;
  @State() private refreshUIHook: number;

  constructor() {
    this.tournaments = tournaments;

    this.uiError = null;
    this.displayTeamSelector = false;
    this.currentMatch = null;
    this.config = {
      minGoal: 0,
    };

    this.initTournaments();
    this.refreshUI();
  }

  private async initTournaments(): Promise<number> {
    this.tournament = await this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return 0;
    }

    this.matchNumber = this.tournament.matchs.length;
    return this.updateTournament();
  }

  async updateTournament(): Promise<number> {
    if (!this.tournament) {
      return 0;
    }

    return this.tournaments.update(this.tournament);
  }

  public onTeamChange(detail: InputChangeEventDetail, team: TeamRow, key: string): void {
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
    this.teamToSelect = this.teamToSelect?.map(row => row) || null;
    this.refreshUIHook = uuid.new();
  }

  private resetRowStates() {
    this.teamToSelect?.forEach(row => {
      row.selected = false;
    });
  }

  private cleanRowStates() {
    this.teamToSelect?.forEach(row => {
      if (row.team.id !== this.currentMatch?.hostId && row.team.id !== this.currentMatch?.visitorId) {
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
      if (!this.currentMatch.hostId) {
        this.currentMatch.hostId = row.team.id;
      } else {
        this.currentMatch.visitorId = row.team.id;
      }

      this.cleanRowStates();
    } else {
      if (this.currentMatch.hostId === row.team.id) {
        this.currentMatch.hostId = null;
      } else {
        this.currentMatch.visitorId = null;
      }
    }

    this.refreshUI();
  }

  private async deleteMatch(match: Match) {
    const response = await Utils.confirmChoice('Supprimer le match ?');

    if (!this.tournament?.matchs || !response) {
      return;
    }

    for (let i = 0, imax = this.tournament.matchs.length; i < imax; i++) {
      if (!this.tournament.matchs[i].id || this.tournament.matchs[i].id === match.id) {
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

  private onTeamScores(match: Match, teamType: MatchTeamType, ev: InputChangeEventDetail) {
    const value = Number(ev.value);
    if (teamType === MatchTeamType.VISITOR) {
      match.goals.visitor = value;
    } else {
      match.goals.host = value;
    }

    this.updateTournament();
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

  private getTypeLogo(): string {
    if (!this.tournament) {
      return '404';
    }

    let logo;
    switch (this.tournament.type) {
      case TournamentType.NBA:
        logo = '🏀';
        break;
      case TournamentType.BASKET:
        logo = '🏀';
        break;
      case TournamentType.NFL:
        logo = '🏈';
        break;
      case TournamentType.RUGBY:
        logo = '🏉';
        break;
      default:
        logo = '⚽️';
        break;
    }

    return logo;
  }

  private renderActionButtons(match: Match) {
    return (
      <div>
        <ion-button onClick={() => this.deleteMatch(match)} class="ion-margin-horizontal" color="warning" size="default">
          <sl-icon slot="icon-only" name="trash" class="xl"></sl-icon>
        </ion-button>

        {match.status === MatchStatus.DOING ? (
          <ion-button onClick={() => this.stopMatch(match)} class="ion-margin-horizontal" color="secondary" size="default">
            <sl-icon slot="icon-only" name="stop-circle" class="xl"></sl-icon>
          </ion-button>
        ) : (
          <ion-button onClick={() => this.playMatch(match)} class="ion-margin-horizontal" color="secondary" size="default">
            <sl-icon slot="icon-only" name="play-circle" class="xl"></sl-icon>
          </ion-button>
        )}
      </div>
    );
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button text="Retour" defaultHref={`/tournament/${this.tournament?.id}`}></ion-back-button>
            </ion-buttons>
            <ion-title>
              <span class="light container">{this.getTypeLogo()}</span>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">
          {this.uiError ? (
            <div>
              <ion-card color="danger">
                <ion-card-header>
                  <ion-card-title>
                    <sl-icon name="bug" class="xxxxl light"></sl-icon>
                    <span class="light container-xl">Erreur</span>
                  </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                  <sl-icon name="cone-striped" class="xl warning"></sl-icon>
                  <span class="container">{this.uiError}</span>
                </ion-card-content>
              </ion-card>
            </div>
          ) : (
            <div class="ion-text-center ion-justify-content-center">
              <h2 class="ion-padding-vertical">{this.tournament?.name}</h2>
              <h3 class="ion-padding-vartical">Match(s)</h3>

              {this.matchNumber > 0 && !this.displayTeamSelector ? (
                <div>
                  <ion-grid class="page-match-grid">
                    <ion-row class="page-match-grid-header ion-align-items-center">
                      <ion-col size="5">
                        <span>Locaux</span>
                      </ion-col>
                      <ion-col size="2">
                        <sl-icon class="xxl" name="trophy"></sl-icon>
                      </ion-col>
                      <ion-col size="5">
                        <span>Visiteurs</span>
                      </ion-col>
                    </ion-row>
                  </ion-grid>

                  {this.tournament?.matchs.map(match => (
                    <div class="light-border ion-padding-vertical ion-margin-vertical">
                      <div>
                        {match.status === MatchStatus.PENDING && (
                          <sl-tag variant="primary">
                            <span class="container">Match programmé</span>
                            <sl-icon name="calendar-check" class="primary xl"></sl-icon>
                          </sl-tag>
                        )}
                        {match.status === MatchStatus.DOING && (
                          <sl-tag variant="success">
                            <span class="container">Match en cours</span>
                            <sl-spinner class="xl"></sl-spinner>
                          </sl-tag>
                        )}
                        {match.status === MatchStatus.DONE && (
                          <sl-tag variant="warning">
                            <span class="container">Match terminé</span>
                            <sl-icon name="check2-square" class="warning xl"></sl-icon>
                          </sl-tag>
                        )}
                      </div>

                      <mad-match-tile hostPending={this.getTeam(match.hostId)} visitorPending={this.getTeam(match.visitorId)}></mad-match-tile>

                      <ion-grid>
                        <ion-row class="ion-align-items-center">
                          <ion-col size="6">
                            {(this.tournament?.type === TournamentType.NBA || this.tournament?.type === TournamentType.BASKET) && (
                              <mad-scorer-basket
                                label="🏀"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.HOST, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.host}
                              ></mad-scorer-basket>
                            )}

                            {(this.tournament?.type === TournamentType.FOOT || !this.tournament?.type) && (
                              <mad-input-number
                                label="⚽️"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.HOST, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.host}
                              ></mad-input-number>
                            )}

                            {this.tournament?.type === TournamentType.NFL && (
                              <mad-input-number
                                label="🏈"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.HOST, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.host}
                              ></mad-input-number>
                            )}

                            {this.tournament?.type === TournamentType.RUGBY && (
                              <mad-input-number
                                label="🏉"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.HOST, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.host}
                              ></mad-input-number>
                            )}
                          </ion-col>

                          <ion-col size="6">
                            {(this.tournament?.type === TournamentType.NBA || this.tournament?.type === TournamentType.BASKET) && (
                              <mad-scorer-basket
                                label="🏀"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.visitor}
                              ></mad-scorer-basket>
                            )}

                            {this.tournament?.type === TournamentType.FOOT && (
                              <mad-input-number
                                label="⚽️"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.visitor}
                              ></mad-input-number>
                            )}

                            {this.tournament?.type === TournamentType.NFL && (
                              <mad-input-number
                                label="🏈"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.visitor}
                              ></mad-input-number>
                            )}

                            {this.tournament?.type === TournamentType.RUGBY && (
                              <mad-input-number
                                label="🏉"
                                class="ion-margin"
                                readonly={match.status !== MatchStatus.DOING}
                                onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail)}
                                min={this.config.minGoal}
                                value={match.goals.visitor}
                              ></mad-input-number>
                            )}
                          </ion-col>
                        </ion-row>
                      </ion-grid>

                      {this.refreshUIHook ? this.renderActionButtons(match) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {this.displayTeamSelector ? null : (
                    <div class="ion-text-center ion-justify-content-center">
                      <h2>
                        <span class="warning"> Aucun match en cours </span>
                      </h2>
                    </div>
                  )}
                </div>
              )}

              {this.displayTeamSelector ? (
                <div>
                  <h3>Équipes sélectionnées:</h3>
                  <mad-match-tile
                    hostPending={this.getTeam(this.currentMatch?.hostId || null)}
                    visitorPending={this.getTeam(this.currentMatch?.visitorId || null)}
                  ></mad-match-tile>

                  <ion-grid class="page-match-grid">
                    <ion-row class="page-match-grid-header ion-align-items-center">
                      <ion-col size="2">
                        <sl-icon name="list-check" class="xl"></sl-icon>
                      </ion-col>
                      <ion-col>
                        <span>Équipes</span>
                      </ion-col>
                      <ion-col>
                        <span class="container-s">
                          <sl-icon name="stack-overflow"></sl-icon>
                        </span>
                        <span class="ion-hide-lg-down">Matchs </span>
                        <span class="ion-hide-md-down">Total </span>
                      </ion-col>
                      <ion-col>
                        <span class="container-s">
                          <sl-icon name="check2-square"></sl-icon>
                        </span>
                        <span class="ion-hide-lg-down">Matchs </span>
                        <span class="ion-hide-md-down">Joués </span>
                      </ion-col>
                      <ion-col>
                        <span class="container-s">
                          <sl-icon name="calendar-check"></sl-icon>
                        </span>
                        <span class="ion-hide-lg-down">Matchs </span>
                        <span class="ion-hide-md-down">Programmés </span>
                      </ion-col>
                    </ion-row>

                    {this.teamToSelect?.map(row => (
                      <ion-row onClick={() => this.onTeamSelected(row)} class="ion-align-items-center clickable">
                        <ion-col size="2">
                          {row.selected ? <sl-icon name="check-square" class="success xl"></sl-icon> : <sl-icon name="square" class="success xl"></sl-icon>}
                        </ion-col>
                        <ion-col>
                          <mad-team-tile team={row.team.team}></mad-team-tile>
                        </ion-col>
                        <ion-col>{row.totalMatchs}</ion-col>
                        <ion-col>{row.doneMatchs}</ion-col>
                        <ion-col>{row.scheduledMatchs}</ion-col>
                      </ion-row>
                    ))}
                  </ion-grid>

                  <ion-grid>
                    <ion-row>
                      <ion-col size="6">
                        <ion-button expand="full" color="secondary" class="ion-margin-vertical" onClick={() => this.cancelSelection()}>
                          <sl-icon name="ban" class="xxl"></sl-icon>
                          <span class="container">Annuler</span>
                        </ion-button>
                      </ion-col>
                      <ion-col size="6">
                        <ion-button
                          expand="full"
                          color="secondary"
                          class="ion-margin-vertical"
                          disabled={Boolean(this.currentMatch && (!this.currentMatch.visitorId || !this.currentMatch.hostId))}
                          onClick={() => this.goValidateSelection()}
                        >
                          <span class="container">Valider</span>
                          <sl-icon name="arrow-right" class="xxl"></sl-icon>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                  </ion-grid>
                </div>
              ) : (
                <div>
                  <ion-button expand="full" color="secondary" class="ion-margin-vertical" onClick={() => this.goMatch()}>
                    <sl-icon name="plus-lg" class="xxl"></sl-icon>
                    <span class="container">Nouveau match</span>
                  </ion-button>
                </div>
              )}
            </div>
          )}
        </ion-content>
      </Host>
    );
  }
}
