import { InputChangeEventDetail } from "@ionic/core";
import { Component, h, Host, Listen, Prop, State } from "@stencil/core";
import { TeamRow } from "../../modules/team-row/team-row";
import { MadInputNumberCustomEvent, MadSelectTeamCustomEvent } from "../../components";
import tournaments from "../../modules/tournaments/tournaments";
import { Tournament, TournamentType } from "../../modules/tournaments/tournaments.d";
import Utils from "../../modules/utils/utils";
import { GenericTeam } from "../../components.d";

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

  private counter: number;

  @Prop() public tournamentId: number;

  @State() private tournament: Tournament | null;
  @State() private uiError: string | null;
  @State() private isEditTournamentName: boolean;
  @State() private teamNumber: number;

  constructor() {
    this.conf = {
      teamNumberDefault: 4,
      teamNumberMax: 32,
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
    this.counter = 0;

    this.teamNumber = this.tournament.grid.length || this.conf.teamNumberDefault;
    this.updateTournament();

  }

  @Listen("ionRouteDidChange", {
    target: "window"
  }) routerGoesHere() {
    this.updateTournament();
  }

  onTeamNumberChange(detail?: InputChangeEventDetail): void {
    this.teamNumber = Number(detail && detail.value || this.conf.teamNumberDefault);
    this.updateTournament();
  }

  getVirginTeamRow(type: TournamentType): TeamRow { return new TeamRow({ type }); }

  updateTournament(): void {
    if (!this.tournament) { return; }

    const oldGrid = this.tournament.grid;
    // Change ref to refresh UI
    this.tournament = {
      id: this.tournament.id,
      name: this.tournament.name,
      grid: [],
      matchs: this.tournament.matchs,
      type: this.tournament.type
    };

    for (let i = 0; i < this.teamNumber; i++) {
      this.tournament.grid[i] = oldGrid[i] || this.getVirginTeamRow(this.tournament.type);
    }

    this.counter = 0;
    this.tournaments.update(this.tournament);
  }

  onTeamTeamChange(detail: GenericTeam, team: TeamRow): void {
    team.team = detail;

    this.updateTournament();
  }

  onTeamChange(detail: InputChangeEventDetail, team: TeamRow, key: string): void {
    team.set(key, String(detail.value));
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateTournament();
  }

  private goRanking(): void {
    if (!this.tournament) { return; }

    const gridClone = this.tournament.grid.map(team => team) as Array<TeamRow>;
    gridClone.sort((a: TeamRow, b: TeamRow) => b.goalAverage - a.goalAverage);
    this.tournament.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);

    this.updateTournament();
  }

  private resetGrid(): void {
    if (!this.tournament) { return; }

    this.tournament.grid = [];
    this.tournament.matchs = [];
    this.teamNumber = this.conf.teamNumberDefault;
    this.updateTournament();
  }

  private async confirmResetGrid(): Promise<void> {
    const confirm = await Utils.confirmChoice("Es-tu sûre de vouloir effacer les noms, ainsi que les scores de toutes les équipes ?");
    if (confirm) {
      this.resetGrid();
    }
  }

  private onEditTournamentName() {
    this.isEditTournamentName = true;
    Utils.setFocus(`ion-input#${this.inputNameId}`);
  }

  private onTournamentNameChange(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.editTournamentName();
    }
  }

  private editTournamentName() {
    if (!this.tournament) { return; }

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
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button text="Retour" defaultHref="/app/tournaments"></ion-back-button>
            </ion-buttons>
            <ion-title>
              <ion-text color="light" size="large" class="ion-margin">{this.tournament?.name ? "🏆" : "404"}</ion-text>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding">

          {this.uiError ?
            <div>
              <ion-card color="danger">
                <ion-card-header>
                  <ion-card-title>
                    <ion-icon name="skull-outline" size="default" color="light"></ion-icon>
                    <ion-text color="light" class="ion-margin">Erreur</ion-text>
                  </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                  <ion-text color="warning">{this.uiError}</ion-text>
                </ion-card-content>
              </ion-card>
            </div> :
            <div>

              {this.isEditTournamentName ?
                <ion-grid class="grid-edit-tournament-center">
                  <ion-row class="ion-align-items-end ion-justify-content-center">
                    <ion-col size="1">
                      <ion-button size="small" color="tertiary"
                        onClick={() => { this.isEditTournamentName = false; }}
                        fill="solid">
                        <ion-icon slot="icon-only" name="close-circle-outline"></ion-icon>
                      </ion-button>
                    </ion-col>
                    <ion-col size="10" size-sm="8" size-md="6" size-lg="4">
                      <ion-input
                        id={this.inputNameId}
                        color="primary"
                        inputmode="text"
                        autofocus="true"
                        name="tournamentName"
                        value={this.tournament?.name}
                        onkeypress={(ev: KeyboardEvent) => this.onTournamentNameChange(ev)} />
                    </ion-col>
                    <ion-col size="1">
                      <ion-button size="small" color="secondary"
                        onClick={() => this.editTournamentName()}
                        fill="solid">
                        <ion-icon slot="icon-only" name="save-outline"></ion-icon>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
                :
                <ion-grid class="can-be-clicked grid-edit-tournament-center" onClick={() => this.onEditTournamentName()}>
                  <ion-row class="ion-align-items-end ion-justify-content-center">
                    <ion-col size="1">
                      <ion-icon name="trophy-outline" size="large" color="secondary"></ion-icon>
                    </ion-col>
                    <ion-col size="10" size-sm="8" size-md="6" size-lg="4">
                      <h2 class="ion-padding-horizontal">{this.tournament?.name}</h2>
                    </ion-col>
                    <ion-col size="1">
                      <ion-icon name="pencil-outline" size="large" color="secondary"></ion-icon>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              }

              <ion-grid class="grid-edit-tournament-center">
                <ion-row class="ion-align-items-end ion-justify-content-center">
                  <ion-col size="10" size-sm="8" size-md="6" size-lg="4" class="ion-padding-vertical">

                    <mad-input-number
                      value={this.teamNumber}
                      label={`Nombre d’équipes (min:${this.conf.teamNumberMin}, max:${this.conf.teamNumberMax})`}
                      onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamNumberChange(ev.detail)}
                      color="primary"
                      min={this.conf.teamNumberMin}
                      max={this.conf.teamNumberMax}
                      step={this.conf.teamNumberStep}
                      placeholder={String(this.conf.teamNumberDefault)}>
                    </mad-input-number>

                  </ion-col>
                </ion-row>
              </ion-grid>

              {this.teamNumber > 0 ?
                <div>
                  <ion-grid class="page-tournament-grid">
                    <ion-row class="page-tournament-grid-header ion-align-items-center">
                      <ion-col size="1"><ion-label color="primary"><ion-icon name="swap-vertical-outline"></ion-icon></ion-label></ion-col>
                      <ion-col size="3"><ion-label color="primary">Équipes</ion-label></ion-col>
                      <ion-col><ion-label color="success">Points</ion-label></ion-col>
                      <ion-col><ion-label color="secondary">Buts <ion-icon name="add-outline"></ion-icon></ion-label></ion-col>
                      <ion-col><ion-label color="tertiary">Buts <ion-icon name="remove-outline"></ion-icon></ion-label></ion-col>
                      <ion-col><ion-label color="warning">Goal average</ion-label></ion-col>
                    </ion-row>

                    {this.tournament?.grid.map((team) =>
                      <ion-row class="ion-align-items-center">
                        <ion-col size="1">
                          <span class="counter">{this.counter > 8 ? null : "0"}{++this.counter}</span>
                        </ion-col>
                        <ion-col size="3">
                          <mad-select-team
                            value={team.team}
                            color="primary"
                            type={this.tournament?.type}
                            onMadSelectChange={(ev: MadSelectTeamCustomEvent<GenericTeam>) => this.onTeamTeamChange(ev.detail, team)}
                            placeholder="Équipe vide">
                          </mad-select-team>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            readonly
                            value={team.points}
                            color="success"
                            min={this.conf.pointMin}
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "points")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            readonly
                            value={team.scoredGoals}
                            min={this.conf.scoredGoalsMin}
                            color="secondary"
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "scoredGoals")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            readonly
                            value={team.concededGoals}
                            min={this.conf.concededGoalsMin}
                            color="tertiary"
                            onMadNumberChange={(ev: MadInputNumberCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev.detail, team, "concededGoals")}
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                        <ion-col>
                          <mad-input-number
                            readonly
                            value={team.goalAverage}
                            color="warning"
                            placeholder="0">
                          </mad-input-number>
                        </ion-col>
                      </ion-row>
                    )}
                  </ion-grid>

                  <ion-button expand="full" color="primary" class="ion-margin-vertical"
                    onClick={() => this.goRanking()}>
                    <ion-icon name="car-sport-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Classement !</ion-text>
                  </ion-button>

                  <ion-button
                    class="ion-margin-vertical"
                    onClick={() => this.confirmResetGrid()}
                    expand="full"
                    color="medium"
                    size="default">
                    <ion-icon name="trash-bin-outline" size-xs="normal" size="large" color="warning"></ion-icon>
                    <ion-text class="ion-margin" color="warning">Effacer</ion-text>
                  </ion-button>

                  <ion-button expand="full" color="secondary" class="ion-margin-vertical"
                    href={`/match/${this.tournament?.id}`} key={this.tournament?.id}>
                    <ion-icon name="medal-outline" size-xs="normal" size="large"></ion-icon>
                    <ion-text class="ion-margin">Go Match</ion-text>
                    <ion-icon name="arrow-forward-outline" size-xs="normal" size="large"></ion-icon>
                  </ion-button>


                </div> :
                <div>
                  <h2 class=""> Choisissez le nombre d’équipes pour commencer ! </h2>
                </div>
              }
            </div>
          }
        </ion-content>
      </Host>
    );
  }

}
