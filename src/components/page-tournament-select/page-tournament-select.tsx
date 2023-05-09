import { Component, Fragment, h, State } from "@stencil/core";
import { Tournament } from "../../modules/tournaments/tournaments.d";
import tournaments from "../../modules/tournaments/tournaments";
import uuid from "../../modules/uuid/uuid";
import utils from "../../modules/utils/utils";

@Component({
  tag: "page-tournament-select",
  styleUrl: "page-tournament-select.css",
  shadow: false,
})
export class PageTournamentSelect {

  private readonly tournaments: typeof tournaments;
  private readonly inputId: string;
  private readonly uuid: typeof uuid;
  private readonly utils: typeof utils;

  @State() private uiAddingTournament: boolean;
  @State() private numberOfTournaments: number;

  constructor () {
    this.tournaments = tournaments;
    this.uuid = uuid;
    this.inputId = "pnii_" + this.uuid.new();
    this.utils = utils;

    this.uiAddingTournament = false;
    this.numberOfTournaments = this.tournaments.length;

    this.tournaments.onUpdate(() => {
      /* Force the UI to refresh, even if the numberOfTournaments have not changed */
      this.numberOfTournaments = 0;
      setTimeout(() => {
          this.numberOfTournaments = this.tournaments.length;
          });
      });
  }

  private removeTournament(event: Event, id: number) {
    event.preventDefault();
    event.stopPropagation();
    this.numberOfTournaments = this.tournaments.remove(id);
  }

  private addTournament () {
    const input = document.querySelector(`ion-input#${this.inputId}`);
    if (!input) {
      console.warn("<page-tournament-select/> Unable to get input value.");
      return;
    }

    // @ts-ignore
    const value = input.value;
    this.numberOfTournaments = this.tournaments.add(value, []);
    this.uiAddingTournament = false;
  }

  private onKeyPressNewName(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.addTournament();
    }
  }

  private hideUiAddingTournament () {
    this.uiAddingTournament = false;
  }

  private displayUiAddingTournament () {
    this.uiAddingTournament = true;
    this.utils.setFocus(`ion-input#${this.inputId}`);
  }


  render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Vos tournois</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list>
            { this.numberOfTournaments ?
                this.tournaments.map((tournament: Tournament) =>
                  <ion-item href={`/tournament/${tournament.id}`} key={tournament.id}>
                    <ion-label slot="start">{tournament.name}</ion-label>
                    <ion-label slot="end">
                      <ion-badge slot="start" class="ion-margin-end"
                        color="tertiary">{ tournament.grid.length }</ion-badge>
                      <ion-icon class="ion-margin-horizontal"
                        onClick={(ev: Event) => this.removeTournament(ev, tournament.id)}
                        slot="end" name="trash-outline"></ion-icon>
                    </ion-label>
                  </ion-item>
                ) :
               <div class="ion-text-center">
                 <h1><ion-icon name="accessibility-outline"></ion-icon> Pas encore de tournois <ion-icon name="football-outline"></ion-icon></h1>
               </div>
            }
          </ion-list>

          <ion-card>
            <ion-card-header>
            </ion-card-header>
            <ion-card-content>
              { this.uiAddingTournament ?
                <div>
                  <ion-item>
                    <ion-label position="floating">Nom du tournois</ion-label>
                    <ion-input color="primary" placeholder="Ligue 1" autofocus="true" inputmode="text" name="tournoiNewName"
                      onkeypress={(ev: KeyboardEvent) => this.onKeyPressNewName(ev)}
                      id={this.inputId} type="text"></ion-input>
                  </ion-item>

                  <ion-button onClick={() => this.addTournament()} expand="full">
                    <ion-icon slot="start" name="add-outline"></ion-icon>
                    Ajouter
                  </ion-button>

                  <ion-button onClick={() => {this.hideUiAddingTournament()}} expand="full" color="secondary">
                    <ion-icon slot="start" name="remove-outline"></ion-icon>
                    Annuler
                  </ion-button>
                </div> :
                <div>
                  <ion-button onClick={() => {this.displayUiAddingTournament()}} expand="full">
                    <ion-icon slot="start" name="add-outline"></ion-icon>
                    Nouveau tournois
                  </ion-button>
                </div>
              }
            </ion-card-content>
          </ion-card>

        </ion-content>
      </Fragment>
    );
  }

}
