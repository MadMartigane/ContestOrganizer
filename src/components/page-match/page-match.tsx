import { InputChangeEventDetail } from "@ionic/core";
import { Component, h, Host, Prop, State } from "@stencil/core";
import { TeamRow } from "../../modules/team-row/team-row";
import tournaments from "../../modules/tournaments/tournaments";
import { Match } from "../../modules/tournaments/tournaments";
import {Tournament} from "../../modules/tournaments/tournaments.d";

type Row = {
  selected: boolean;
  team: TeamRow 
}

@Component({
  tag: "page-match",
  styleUrl: "page-match.css",
  shadow: false,
})
export class PageMatch {
  private readonly tournaments: typeof tournaments;

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
    console.log(" GO MATCH !!");  
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
      if (row.team.id !== this.currentMatch?.host?.id &&
        row.team.id !== this.currentMatch?.visitor?.id) {
        row.selected = false;
      }
    });
  }

  private onTeamSelected(row: Row) {
    row.selected = !row.selected;
   
    if (!this.currentMatch) { return; }

    if (row.selected) {
      if (!this.currentMatch.host) {
        this.currentMatch.host = row.team;
      } else {
        this.currentMatch.visitor = row.team;
      }

      this.cleanRowStates();
    } else {
      if (this.currentMatch?.host?.id === row.team.id) {
        this.currentMatch.host = null;
      } else {
        this.currentMatch.visitor = null;
      }
    }

    this.refreshUI();
  }

  private deleteMatch(match: Match) {
    console.log("delete match: ", match);
    if (!this.tournament?.matchs) { return; }

    console.log("matchs: ", this.tournament.matchs);
    for (let i = 0, imax = this.tournament.matchs.length; i < imax; i++) {
      console.log("delete candidat (%s): ",i, this.tournament.matchs[i]);
      if (!this.tournament.matchs[i].id || this.tournament.matchs[i].id === match.id) {
        this.tournament.matchs.splice(i, 1);
      }
    }

    this.updateTournament();
    this.refreshUI();
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
            </div> :
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

                    {this.tournament?.matchs.map((match) =>
                      <ion-row class="ion-align-items-center">
                        <ion-col size="5">
                          <mad-team-tile team={match.host?.team}></mad-team-tile>
                        </ion-col>
                        <ion-col size="2">
                          <p> VS </p>
                          <p>
                            <ion-button onClick={() => this.deleteMatch(match)}
                              color="secondary" size="small">
                              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                            </ion-button>
                          </p>
                        </ion-col>
                        <ion-col size="5">
                          <mad-team-tile team={match.visitor?.team}></mad-team-tile>
                        </ion-col>
                      </ion-row>
                    )}
                  </ion-grid>
                </div> :
                <div class="ion-text-center ion-justify-content-center">
                  <h2><ion-text color="warning"> Aucun match en cours </ion-text></h2>
                </div>
              }

              { this.displayTeamSelector ?
                <div>
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
                </div> :
                <div>

                  <ion-button expand="full" color="secondary" class="ion-margin-vertical"
                    onClick={() => this.goMatch()}>
                    <ion-icon name="football-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Démarrer !</ion-text>
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
