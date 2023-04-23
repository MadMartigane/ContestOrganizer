import {InputChangeEventDetail, IonInputCustomEvent } from "@ionic/core";
import { Component, Fragment, h, State } from '@stencil/core';
import TeamRow from "../../modules/TeamRow.type";


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
  tag: 'page-conf',
  styleUrl: 'page-conf.css',
  // shadow: true,
})

export class PageConf {
  private teamNumber: number;
  private conf: PageConfConstants;

  @State() grid: Array<TeamRow>;

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

    this.teamNumber = this.conf.teamNumberDefault;
    this.grid = [];
  }

  onTeamNumberChange (detail:InputChangeEventDetail): void {
    this.teamNumber = Number(detail.value || this.conf.teamNumberDefault);
    this.updateGrid(this.teamNumber);
  }

  getVirginTeamRow (id: number) : TeamRow { return new TeamRow(id); }

  updateGrid (teamNumber?:number): void {
    const newGrid = [];
    if (!teamNumber) { teamNumber = this.teamNumber }

    for(let i=0; i<teamNumber; i++) {
      newGrid[i] = this.grid[i] || this.getVirginTeamRow(i);
    }

    this.grid = newGrid;
  }

  onTeamChange (event: IonInputCustomEvent<InputChangeEventDetail>, team: TeamRow, key: string): void {
    team.set(key, event.detail.value);
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateGrid();
  }

  goRanking(): void {
    console.log("goRanking()");
    const gridClone = this.grid.map(team => team) as Array<TeamRow>;
    this.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);
    console.log("newGrid: ", this.grid);
  }


  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Tournois</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <p><ion-icon name="construct-outline" size="large" color="primary"></ion-icon> Configurez votre tournois:</p>

          <ion-list>
            <ion-item>
              <ion-label position="floating">Nombre d'équipes (min:{this.conf.teamNumberMin}, max:{this.conf.teamNumberMax})</ion-label>
              <ion-input
                value={this.teamNumber}
                onIonChange={(event:any) => this.onTeamNumberChange(event.detail)}
                type="number"
                min={this.conf.teamNumberMin}
                max={this.conf.teamNumberMax}
                step={this.conf.teamNumberStep}
                placeholder="{this.conf.teamNumberDefault}">
              </ion-input>
            </ion-item>
          </ion-list>

          <ion-grid>
            <ion-row>
              <ion-col><ion-label color="primary">Nom de l’équipe</ion-label></ion-col>
              <ion-col><ion-label color="primary">Points</ion-label></ion-col>
              <ion-col><ion-label color="primary">Buts <ion-icon name="add-outline"></ion-icon></ion-label></ion-col>
              <ion-col><ion-label color="primary">Buts <ion-icon name="remove-outline"></ion-icon></ion-label></ion-col>
              <ion-col><ion-label color="primary">Goal average</ion-label></ion-col>
            </ion-row>

            {this.grid.map((team) =>
              <ion-row>
                <ion-col>
                  <ion-input
                    value={team.name}
                    type="text"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "name")}
                    placeholder="AC Milan">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.points}
                    type="number"
                    min={this.conf.pointMin}
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "points")}
                    placeholder="0">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.scoredGoals}
                    type="number"
                    min="0"
                    color="primary"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "scoredGoals")}
                    placeholder="0">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.concededGoals}
                    type="number"
                    min="0"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "concededGoals")}
                    placeholder="0">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.goalAverage}
                    type="text"
                    readonly
                    placeholder="0">
                  </ion-input>
                </ion-col>
              </ion-row>
            )}

          </ion-grid>

          <ion-button expand="block" color="primary" onClick={() => this.goRanking()}>
            <ion-icon name="car-sport-outline"></ion-icon>
            <span>Classement !</span>
          </ion-button>

        </ion-content>
      </Fragment>
    );
  }

}
