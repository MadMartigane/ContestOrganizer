import {InputChangeEventDetail, IonInputCustomEvent } from "@ionic/core";
import { Component, Fragment, h, State } from '@stencil/core';
import { TeamRow, TeamRowProperties } from "../../modules/TeamRow.type";


export interface PageConfConstants {
  teamNumberMax: number,
  teamNumberMin: number,
  teamNumberDefault: number,
  scoredGoalsMin: number,
  concededGoalsMin: number,
  teamNumberStep: number,
  pointMin: number,
  gridStorageKey: string,
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
      gridStorageKey: "CONTEST_GRID",
      inputDebounce: 300
    }

    this.grid = this.getStoredGrid();
    this.teamNumber = this.grid.length || this.conf.teamNumberDefault;
  }

  getStoredGrid() {
    const storedGridStr = localStorage.getItem(this.conf.gridStorageKey);
    const grid = storedGridStr ?
      JSON.parse(storedGridStr).map((data: TeamRowProperties) => {
        const team = new TeamRow(data.id);
        team.fromData(data);

        if (team.name === null) {
          team.set("name", "");
        }

        return team;
      }) :
      [];
    return grid;

  }

  setStoredGrid(grid: TeamRow[]): void {
    localStorage.setItem(this.conf.gridStorageKey, JSON.stringify(grid.map((team) => team.toData())));
  }

  onTeamNumberChange (detail?: InputChangeEventDetail): void {
    this.teamNumber = Number(detail && detail.value || this.conf.teamNumberDefault);
    this.updateGrid(this.teamNumber);
  }

  getVirginTeamRow (id: number) : TeamRow { return new TeamRow(id); }

  updateGrid (teamNumber?:number): void {
    const newGrid = [];
    if (!teamNumber) { teamNumber = this.teamNumber }

    for(let i=0; i<teamNumber; i++) {
      newGrid[i] = this.grid[i] || this.getVirginTeamRow(i);
    }

    this.setStoredGrid(newGrid);
    this.grid = newGrid;
  }

  onTeamChange (event: IonInputCustomEvent<InputChangeEventDetail>, team: TeamRow, key: string): void {
    team.set(key, event.detail.value);
    team.goalAverage = team.scoredGoals - team.concededGoals;

    this.updateGrid();
  }

  goRanking(): void {
    const gridClone = this.grid.map(team => team) as Array<TeamRow>;
    gridClone.sort((a: TeamRow, b: TeamRow) => b.goalAverage - a.goalAverage);
    this.grid = gridClone.sort((a: TeamRow, b: TeamRow) => b.points - a.points);
  }

  resetGrid(): void {
    this.grid = [];
    this.teamNumber = this.conf.teamNumberDefault;
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
          <ion-grid>
            <ion-row>
              <ion-col size-xs="8" size="11">
                <p><ion-icon name="construct-outline" size="large" color="primary"></ion-icon> Configurez votre tournois:</p>
              </ion-col>
              <ion-col>
                <ion-button
                  onClick={() => this.resetGrid()}
                  color="medium"
                  size-xs="normal"
                  size="large">
                  <ion-icon
                    name="reload-outline"
                    size-xs="normal"
                    size="large"
                    color="warning">
                  </ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>

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
              <ion-col size="4"><ion-label color="primary">Nom de l’équipe</ion-label></ion-col>
              <ion-col><ion-label color="success">Points</ion-label></ion-col>
              <ion-col><ion-label color="secondary">Buts <ion-icon name="add-outline"></ion-icon></ion-label></ion-col>
              <ion-col><ion-label color="tertiary">Buts <ion-icon name="remove-outline"></ion-icon></ion-label></ion-col>
              <ion-col><ion-label color="warning">Goal average</ion-label></ion-col>
            </ion-row>

            {this.grid.map((team) =>
              <ion-row>
                <ion-col size="4">
                  <ion-input
                    value={team.name}
                    type="text"
                    color="primary"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "name")}
                    placeholder="AC Milan">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.points}
                    type="number"
                    color="success"
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
                    color="secondary"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "scoredGoals")}
                    placeholder="0">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.concededGoals}
                    type="number"
                    min="0"
                    color="tertiary"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "concededGoals")}
                    placeholder="0">
                  </ion-input>
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

          <ion-button expand="block" color="primary" onClick={() => this.goRanking()}>
            <ion-icon name="car-sport-outline"></ion-icon>
            <span>Classement !</span>
          </ion-button>

        </ion-content>
      </Fragment>
    );
  }

}
