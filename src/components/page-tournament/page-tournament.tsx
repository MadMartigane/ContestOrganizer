import { InputChangeEventDetail } from "@ionic/core";
import { Component, Fragment, h, Prop, State } from "@stencil/core";
import { TeamRow } from "../../modules/team-row/team-row";
import { FutDBTeam, MadInputNumberCustomEvent, MadSelectTeamCustomEvent } from "../../components";
import tournaments from "../../modules/tournaments/tournaments";
import {Tournament} from "../../modules/tournaments/tournaments.d";
import Utils from "../../modules/utils/utils";

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
  private readonly inputNameId: string;

  private teamNumber: number;

  @Prop() public tournamentId: number;
  @State() private tournament: Tournament;
  @State() private uiError: string | null;
  @State() private isEditTournamentName: boolean;

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
    this.isEditTournamentName = false;
    this.inputNameId = "page-tournament-input-name-id";

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

  private goRanking(): void {
    const gridClone = this.tournament.grid.map(team => team) as Array<TeamRow>;
    gridClone.sort((a: TeamRow, b: TeamRow) => b.goalAverage - a.goalAverage);
    this.tournament.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);

    this.updateTournament();
  }

  private resetGrid(): void {
    this.tournament.grid = [];
    this.teamNumber = this.conf.teamNumberDefault;
    this.updateTournament();
  }

  private async confirmResetGrid(): Promise<void> {
    const confirm = await Utils.confirmChoice("Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ?");
    if (confirm) {
      this.resetGrid();
    }
  }

  private onEditTournamentName () {
    this.isEditTournamentName = true;
    Utils.setFocus(`ion-input#${this.inputNameId}`);
  }

  private onTournamentNameChange (event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.editTournamentName();
    }
  }

  private editTournamentName () {
    const input = document.querySelector(`ion-input#${this.inputNameId}`);
    if (!input) {
      console.warn("<page-tournament/> Unable to get input tournament name value.");
      return;
    }

    // @ts-ignore
    const newName = String(input.value).trim();
    this.tournament.name = newName;

    this.isEditTournamentName = false;
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
              <ion-text color="light" size="large" class="ion-margin">{ this.tournament?.name ? "🏆" : "404" }</ion-text>
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
              <div>
                <div class="ion-padding-horizontal">
                  {this.isEditTournamentName ?
                    <div>
                        <ion-input
                          id={this.inputNameId}
                          color="primary"
                          inputmode="text"
                          autofocus="true"
                          name="tournamentName"
                          value={this.tournament.name}
                          onkeypress={(ev: KeyboardEvent) => this.onTournamentNameChange(ev)}
                          class="ion-padding-horizontal"/>

                        <ion-button size="default" color="tertiary" class="ion-padding-horizontal"
                          onClick={() => {this.isEditTournamentName = false;}}
                          fill="solid">
                          <ion-icon slot="icon-only" name="close-circle-outline"></ion-icon>
                        </ion-button>

                        <ion-button size="default" color="secondary" class="ion-padding-horizontal"
                          onClick={() => this.editTournamentName()}
                          fill="solid">
                          <ion-icon slot="icon-only" name="save-outline"></ion-icon>
                        </ion-button>
                    </div> :
                    <h2 class="can-be-clicked" onClick={() => this.onEditTournamentName()}>
                        <ion-icon name="trophy-outline" size="large" color="secondary"></ion-icon>
                        <ion-text class="ion-padding-horizontal">{ this.tournament.name }</ion-text>
                        <ion-icon name="pencil-outline" color="secondary"></ion-icon>
                    </h2>
                  }
                </div>
                <div class="ion-padding-horizontal">
                  <mad-input-number
                    value={this.teamNumber}
                    label={ `Nombre d’équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})` }
                    onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamNumberChange(ev.detail)}
                    min={this.conf.teamNumberMin}
                    max={this.conf.teamNumberMax}
                    step={this.conf.teamNumberStep}
                    placeholder={ String(this.conf.teamNumberDefault) }>
                  </mad-input-number>
                </div>
              </div>

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
                    onClick={() => this.confirmResetGrid()}
                    expand="full"
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
