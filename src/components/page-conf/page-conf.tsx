import {InputChangeEventDetail, IonInputCustomEvent } from "@ionic/core";
import { Component, Fragment, h, State } from '@stencil/core';
import TeamRow from "../../modules/TeamRow.type";


@Component({
  tag: 'page-conf',
  styleUrl: 'page-conf.css',
  // shadow: true,
})

export class PageConf {
  /* Keep teamNumber as Prop.
   * Since grid is an external type, the autogenerated /src/components.d fail to find TeamRow as type
   * I removed this.grid from the Prop. this.teamNumber as Prop trigger the UI update. #noobHack :-/ */
  private teamNumber: number;

  @State() grid: Array<TeamRow>;

  constructor() {
    this.grid = [];
    this.teamNumber = 0;
  }

  onTeamNumberChange (detail:InputChangeEventDetail): void {
    this.teamNumber = Number(detail.value || "2");
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

    this.updateGrid()
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
              <ion-label position="floating">Nombre d'équipes (min:2, max:8)</ion-label>
              <ion-input
                value={this.teamNumber}
                onIonChange={(event:any) => this.onTeamNumberChange(event.detail)}
                type="number"
                min="2"
                max="16"
                step="2"
                placeholder="8">
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
                    debounce="600"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "name")}
                    placeholder="AC Milan">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.points}
                    type="number"
                    min="0"
                    debounce="600"
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
                    debounce="600"
                    onIonChange={(ev: IonInputCustomEvent<InputChangeEventDetail>) => this.onTeamChange(ev, team, "scoredGoals")}
                    placeholder="0">
                  </ion-input>
                </ion-col>
                <ion-col>
                  <ion-input
                    value={team.concededGoals}
                    type="number"
                    min="0"
                    debounce="600"
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
        </ion-content>
      </Fragment>
    );
  }

}
