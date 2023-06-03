import { InputChangeEventDetail } from "@ionic/core";
import { Component, h, Host, Prop, State } from "@stencil/core";
import { TeamRow } from "../../modules/team-row/team-row";
import tournaments from "../../modules/tournaments/tournaments";
import { Match } from "../../modules/tournaments/tournaments";
import { Tournament, MatchTeamType } from "../../modules/tournaments/tournaments.d";
import Utils from "../../modules/utils/utils";
import { MadInputNumberCustomEvent } from "../../components";

type Row = {
  selected: boolean;
  team: TeamRow
}
type Config = {
  minGoal: number;
}

@Component({
  tag: "page-match",
  styleUrl: "page-match.css",
  shadow: false,
})
export class PageMatch {
  private readonly tournaments: typeof tournaments;
  private readonly config: Config;

  private currentMatch: Match | null;

  @Prop() public tournamentId: number;
  @State() private tournament: Tournament | null;
  @State() private uiError: string | null;
  @State() private displayTeamSelector: boolean;
  @State() private teamToSelect: Row[];
  @State() private matchNumber: number;

  constructor() {
    this.tournaments = tournaments;

    this.tournament = this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return;
    }

    this.uiError = null;
    this.displayTeamSelector = false;
    this.currentMatch = null;
    this.teamToSelect = this.tournament.grid.map((team) => ({
      selected: false,
      team
    }));

    this.config = {
      minGoal: 0
    };

    this.matchNumber = this.tournament.matchs.length;
    this.updateTournament();
  }

  updateTournament (): void {
    if (!this.tournament) { return; }

    this.tournaments.update(this.tournament);
  }

  onTeamChange (detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  private goMatch() {
    this.displayTeamSelector = true;
    this.currentMatch = new Match();

    if (!this.tournament) { return;  }

    if (!this.tournament.matchs) {
      this.tournament.matchs = [];
    }
    this.tournament.matchs.push(this.currentMatch);

    this.matchNumber = this.tournament.matchs.length;
    this.updateTournament();
  }

  private refreshUI() {
    // change ref
    this.teamToSelect = this.teamToSelect.map(row => (row));
  }

  private cleanRowStates() {
    this.teamToSelect.forEach((row) => {
      if (row.team.id !== this.currentMatch?.hostId &&
        row.team.id !== this.currentMatch?.visitorId) {
        row.selected = false;
      }
    });
  }

  private onTeamSelected(row: Row) {
    row.selected = !row.selected;

    if (!this.currentMatch) { return; }

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

    this.updateTournament();
    this.refreshUI();
  }

  private async deleteMatch(match: Match) {
    const response = await Utils.confirmChoice("Supprimer le match ?");

    if (!this.tournament?.matchs || !response) { return; }

    for (let i = 0, imax = this.tournament.matchs.length; i < imax; i++) {
      if (!this.tournament.matchs[i].id || this.tournament.matchs[i].id === match.id) {
        this.tournament.matchs.splice(i, 1);
        break;
      }
    }

    this.updateTournament();
    this.refreshUI();
  }

  private goValidateSelection() {
    this.displayTeamSelector = false;
    this.currentMatch = null;
  }

  private selectMatch(match: Match) {
    console.log("selected match: ", match);
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

  private getTeam(teamId: number | null): TeamRow | null {
    if (!this.tournament) { return null; }

    return this.tournaments.getTournamentTeam(this.tournament, teamId);
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref={`/tournament/${this.tournament?.id}`}></ion-back-button>
            </ion-buttons>
            <ion-title>
              <ion-text color="light" size="large" class="ion-margin">{ this.tournament?.name ? "⚽️" : "404" }</ion-text>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">

          { this.uiError ?
            <div>
              <ion-card color="danger">
                <ion-card-header>
                  <ion-card-title>
                    <ion-icon name="skull-outline" size="default" color="light"></ion-icon>
                    <ion-text color="light" class="ion-margin">Erreur</ion-text>
                  </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                  <ion-text>🚧</ion-text>
                  <ion-text color="warning">{ this.uiError }</ion-text>
                </ion-card-content>
              </ion-card>
            </div>

            :

            <div class="ion-text-center ion-justify-content-center">

              <h2 class="ion-padding-vertical">{this.tournament?.name}</h2>
              <h3 class="ion-padding-vartical">Match(s)</h3>

              {this.matchNumber > 0 && !this.displayTeamSelector ?
                <div>
                  <ion-grid class="page-match-grid">
                    <ion-row class="page-match-grid-header ion-align-items-center">
                      <ion-col size="5"><ion-label color="primary">Locaux</ion-label></ion-col>
                      <ion-col size="2"><ion-label color="primary"><ion-icon name="medal-outline"></ion-icon></ion-label></ion-col>
                      <ion-col size="5"><ion-label color="primary">Visiteurs</ion-label></ion-col>
                    </ion-row>
                  </ion-grid>

                  {this.tournament?.matchs.map((match) =>
                    <div class="light-border ion-padding-vertical ion-margin-vertical">

                      <mad-match-tile host={this.getTeam(match.hostId)} visitor={this.getTeam(match.visitorId)}></mad-match-tile>

                      <ion-grid>
                        <ion-row class="ion-align-items-center">
                          <ion-col size="6">

                            <mad-input-number color="primary" label="⚽️" class="ion-margin"
                              onMadNumberChange={
                                (ev: MadInputNumberCustomEvent<InputChangeEventDetail>) =>
                                  this.onTeamScores(match, MatchTeamType.HOST, ev.detail)
                              }
                              min={this.config.minGoal} value={match.goals.host}></mad-input-number>
                          </ion-col>

                          <ion-col size="6">
                            <mad-input-number color="primary" label="⚽️" class="ion-margin"
                              onMadNumberChange={
                                (ev: MadInputNumberCustomEvent<InputChangeEventDetail>) =>
                                  this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail)
                              }
                              min={this.config.minGoal} value={match.goals.visitor}></mad-input-number>
                          </ion-col>
                        </ion-row>
                      </ion-grid>

                      <div>
                        <ion-button onClick={() => this.deleteMatch(match)}
                          class="ion-margin-horizontal" color="warning" size="default">
                          <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                        </ion-button>

                        <ion-button onClick={() => this.selectMatch(match)}
                          class="ion-margin-horizontal" color="secondary" size="delault">
                          <ion-icon slot="icon-only" name="play-outline"></ion-icon>
                        </ion-button>
                      </div>

                    </div>
                  )}
                </div>
                :
                <div class="ion-text-center ion-justify-content-center">
                  <h2><ion-text color="warning"> Aucun match en cours </ion-text></h2>
                </div>
              }

              { this.displayTeamSelector ?
                <div>

                  <h3>Équipes sélectionnées:</h3>
                  <mad-match-tile host={this.getTeam(this.currentMatch?.hostId || null)}
                    visitor={this.getTeam(this.currentMatch?.visitorId || null)}></mad-match-tile>

                  <ion-grid class="page-match-grid">
                    <ion-row class="page-match-grid-header ion-align-items-center">
                      <ion-col size="2"><ion-label color="primary"><ion-icon name="swap-vertical-outline"></ion-icon></ion-label></ion-col>
                      <ion-col size="2"><ion-label color="primary"><ion-icon name="checkbox-outline"></ion-icon></ion-label></ion-col>
                      <ion-col size="5"><ion-label color="primary">Équipes</ion-label></ion-col>
                    </ion-row>

                    {this.teamToSelect.map((row) =>
                      <ion-row
                        onclick={() => this.onTeamSelected(row)}
                        class="ion-align-items-center clickable">
                        <ion-col size="2">
                          {row.selected ?
                            <ion-icon color="success" size="large" name="checkbox-outline"></ion-icon>
                            :
                            <ion-icon color="secondary" size="large" name="square-outline"></ion-icon>
                          }
                        </ion-col>
                        <ion-col size="5">
                          <mad-team-tile team={row.team.team}></mad-team-tile>
                        </ion-col>
                      </ion-row>
                    )}
                  </ion-grid>

                  <ion-button expand="full" color="secondary" class="ion-margin-vertical"
                    onClick={() => this.goValidateSelection()}>
                    <ion-icon name="rocket-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Valider !</ion-text>
                  </ion-button>

                </div>
                :
                <div>

                  <ion-button expand="full" color="secondary" class="ion-margin-vertical"
                    onClick={() => this.goMatch()}>
                    <ion-icon name="football-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Nouveau match !</ion-text>
                  </ion-button>

                </div>
              }
            </div>
          }
        </ion-content>
      </Host>
    );
  }

}
