import { InputChangeEventDetail } from "@ionic/core";
import { Component, Fragment, h, Prop, State } from "@stencil/core";
import { TeamRow } from "../../modules/team-row/team-row";
import { FutDBTeam, MadInputNumberCustomEvent, MadSelectTeamCustomEvent } from "../../components";
import tournaments from "../../modules/tournaments/tournaments";
import {Tournament} from "../../modules/tournaments/tournaments.d";

export interface PageConfConstants {
  teamNumberMax: number,
  teamNumberMin: number,
  teamNumberDefault: number,
  scoredGoalsMin: number,
  concededGoalsMin: number,
  teamNumberStep: number,
  pointMin: number,
  inputDebounce: number
}


@Component({
  tag: "page-tournament",
  styleUrl: "page-tournament.css",
  shadow: false,
})

export class PageTournament {
  private readonly tournaments: typeof tournaments;
  private readonly conf: PageConfConstants;

  private teamNumber: number;

  @Prop() public tournamentId: number;
  @State() private tournament: Tournament;
  @State() private uiError: string | null;

  constructor() {
    this.conf = {
      teamNumberDefault: 4,
      teamNumberMax: 16,
      teamNumberMin: 2,
      teamNumberStep: 2,
      scoredGoalsMin: 0,
      concededGoalsMin: 0,
      pointMin: 0,
      inputDebounce: 300
    }
    this.tournaments = tournaments;

    this.tournament = this.tournaments.get(this.tournamentId);

    if (!this.tournament) {
      this.uiError = `Tournois #${this.tournamentId} non trouvé.`;
      return;
    }
    this.uiError = null;

    this.teamNumber = this.tournament.grid.length || this.conf.teamNumberDefault;
    this.updateTournament();

  }

  onTeamNumberChange (detail?: InputChangeEventDetail): void {
    this.teamNumber = Number(detail && detail.value || this.conf.teamNumberDefault);
    this.updateTournament();
  }

  getVirginTeamRow () : TeamRow { return new TeamRow(); }

  updateTournament (): void {
    const newTournament = {
      id: this.tournament.id,
      name: this.tournament.name,
      grid: []
    };

    for(let i = 0; i < this.teamNumber; i++) {
      newTournament.grid[i] = this.tournament.grid[i] || this.getVirginTeamRow();
    }

    this.tournaments.update(newTournament);
    this.tournament = newTournament;
  }

  onTeamTeamChange (detail: FutDBTeam, team: TeamRow): void {
    team.team = detail;

    this.updateTournament();
  }

  onTeamChange (detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, detail.value);
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  goRanking(): void {
    const gridClone = this.tournament.grid.map(team => team) as Array<TeamRow>;
    gridClone.sort((a: TeamRow, b: TeamRow) => b.goalAverage - a.goalAverage);
    this.tournament.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);

    this.updateTournament();
  }

  resetGrid(): void {
    this.tournament.grid = [];
    this.teamNumber = this.conf.teamNumberDefault;
    this.updateTournament();
  }

  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/app/tournaments"></ion-back-button>
            </ion-buttons>
            <ion-title>
              <ion-text color="light" size="large" class="ion-margin">{ this.tournament?.name || "404" }</ion-text>
              <ion-icon name="trophy-outline" size="default" color="light"></ion-icon>
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
                  <ion-text color="warning">{ this.uiError }</ion-text>
                </ion-card-content>
              </ion-card>
            </div> :
            <div>
              <ion-list>
                <ion-item>
                  <mad-input-number
                    value={this.teamNumber}
                    label={ `Nombre d’équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})` }
                    onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamNumberChange(ev.detail)}
                    min={this.conf.teamNumberMin}
                    max={this.conf.teamNumberMax}
                    step={this.conf.teamNumberStep}
                    placeholder={ String(this.conf.teamNumberDefault) }>
                  </mad-input-number>
                </ion-item>
              </ion-list>

              {this.teamNumber > 0 ?
                <div>
                  <ion-grid>
                    <ion-row>
                      <ion-col size="4"><ion-label color="primary">Nom de l’équipe</ion-label></ion-col>
                      <ion-col><ion-label color="success">Points</ion-label></ion-col>
                      <ion-col><ion-label color="secondary">Buts <ion-icon name="add-outline"></ion-icon></ion-label></ion-col>
                      <ion-col><ion-label color="tertiary">Buts <ion-icon name="remove-outline"></ion-icon></ion-label></ion-col>
                      <ion-col><ion-label color="warning">Goal average</ion-label></ion-col>
                    </ion-row>

                      {this.tournament.grid.map((team) =>
                      <ion-row>
                        <ion-col size="4">
                          <mad-select-team
                            value={team.team}
                            color="primary"
                            onMadSelectChange={(ev: MadSelectTeamCustomEvent<FutDBTeam>) => this.onTeamTeamChange(ev.detail, team)}
                            placeholder="AC Milan">
                          </mad-select-team>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            value={team.points}
                            color="success"
                            min={this.conf.pointMin}
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "points")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            value={team.scoredGoals}
                            min={this.conf.scoredGoalsMin}
                            color="secondary"
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "scoredGoals")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            value={team.concededGoals}
                            min={this.conf.concededGoalsMin}
                            color="tertiary"
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "concededGoals")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <ion-input
                            value={team.goalAverage}
                            type="text"
                            color="warning"
                            readonly
                            placeholder="0">
                          </ion-input>
                        </ion-col>
                      </ion-row>
                    )}
                  </ion-grid>

                  <ion-button expand="full" color="primary" class="ion-margin"
                    onClick={() => this.goRanking()}>
                    <ion-icon name="car-sport-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Classement !</ion-text>
                  </ion-button>

                  <ion-button
                    class="ion-margin"
                    expand="full"
                    onClick={() => this.resetGrid()}
                    color="medium"
                    size="default">
                    <ion-icon name="trash-bin-outline" size-xs="normal" size="large" color="warning"></ion-icon>
                    <ion-text class="ion-margin" color="warning">Effacer</ion-text>
                  </ion-button>

                </div> :
                <div>
                  <h2 class=""> Choisissez le nombre d’équipes pour commencer ! </h2>
                </div>
              }
          </div>
        }

        </ion-content>
      </Fragment>
    );
  }

}