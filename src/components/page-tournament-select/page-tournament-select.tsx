import { Component, Fragment, h, State } from '@stencil/core';
import { Tournament, TournamentType, TournamentTypeLabel } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import uuid from '../../modules/uuid/uuid';
import Utils from '../../modules/utils/utils';
import { SelectCustomEvent } from '@ionic/core';

@Component({
  tag: 'page-tournament-select',
  styleUrl: 'page-tournament-select.css',
  shadow: false,
})
export class PageTournamentSelect {
  private readonly tournaments: typeof tournaments;
  private readonly inputId: string;
  private readonly uuid: typeof uuid;
  private readonly selectTournamentTypeId: number;
  private currentTournamentTypeSelected: TournamentType | null;

  @State() private uiAddingTournament: boolean;
  @State() private numberOfTournaments: number;
  @State() private isNewTournamentNameReady: boolean;

  constructor() {
    this.tournaments = tournaments;
    this.uuid = uuid;
    this.inputId = 'pnii_' + this.uuid.new();

    this.uiAddingTournament = false;
    this.numberOfTournaments = this.tournaments.length;

    this.tournaments.onUpdate(() => {
      /* Force the UI to refresh, even if the numberOfTournaments have not changed */
      this.numberOfTournaments = 0;
      setTimeout(() => {
        this.numberOfTournaments = this.tournaments.length;
      });
    });

    this.selectTournamentTypeId = uuid.new();
    this.currentTournamentTypeSelected = null;
  }

  private async confirmRemoveTournament(event: Event, id: number) {
    event.preventDefault();
    event.stopPropagation();

    const tournament = await this.tournaments.get(id);
    const confirm = await Utils.confirmChoice(`Supprimer le tournoi: ${tournament?.name}?`);
    if (confirm) {
      this.removeTournament(id);
    }
  }

  private async removeTournament(id: number) {
    this.numberOfTournaments = await this.tournaments.remove(id);
  }

  private async getNewTournamentNameValue(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const input = document.querySelector(`ion-input#${this.inputId}`) as HTMLInputElement;
        if (!input) {
          console.warn('<page-tournament-select/> Unable to get input value.');
          reject(null);
        }

        resolve(input.value || null);
      });
    });
  }

  private async addTournament() {
    const value = await this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    this.numberOfTournaments = await this.tournaments.add({
      name: value,
      grid: [],
      matchs: [],
      type: this.currentTournamentTypeSelected || TournamentType.FOOT,
    });

    this.uiAddingTournament = false;
  }

  private async onKeyPressNewName(event: KeyboardEvent) {
    const value = await this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    if (value.length < 3) {
      this.isNewTournamentNameReady = false;
      return;
    }

    this.isNewTournamentNameReady = true;

    if (event.key === 'Enter') {
      this.addTournament();
    }
  }

  private hideUiAddingTournament() {
    this.uiAddingTournament = false;
  }

  private displayUiAddingTournament() {
    this.uiAddingTournament = true;
    this.currentTournamentTypeSelected = null;
    this.isNewTournamentNameReady = false;

    Utils.setFocus(`ion-input#${this.inputId}`);
    setTimeout(() => {
      this.watchSelectTournamentType();
    }, 100);
  }

  private watchSelectTournamentType() {
    // TODO const select = document.querySelector(`ion-select#${this.selectTournamentTypeId}`);
    const select = document.querySelector('ion-select');

    if (!select) {
      return;
    }

    select.addEventListener('ionChange', (e: SelectCustomEvent) => {
      const value = e.detail.value;
      this.currentTournamentTypeSelected = value;
    });
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
            {this.numberOfTournaments ? (
              this.tournaments.map((tournament: Tournament) => (
                <ion-item href={`/tournament/${tournament.id}`}>
                  <ion-label slot="start">
                    {tournament.name} - {this.tournaments.getTournamentTypeLabel(tournament.type)}
                  </ion-label>
                  <ion-label slot="end">
                    <ion-badge slot="start" class="ion-margin-end" color="tertiary">
                      {tournament.grid.length}
                    </ion-badge>
                    <mad-icon class="ion-margin-horizontal" onClick={(ev: Event) => this.confirmRemoveTournament(ev, tournament.id)} slot="end" name="trash" medium></mad-icon>
                  </ion-label>
                </ion-item>
              ))
            ) : (
              <div class="ion-text-center">
                <h1>
                  <mad-icon name="trophy" l secondary></mad-icon> Pas encore de tournois <mad-icon name="games" l secondary></mad-icon>
                </h1>
              </div>
            )}
          </ion-list>

          <ion-card>
            <ion-card-header></ion-card-header>
            <ion-card-content>
              {this.uiAddingTournament ? (
                <div>
                  <ion-item>
                    <ion-label position="floating">Nom du tournois</ion-label>
                    <ion-input
                      color="dark"
                      placeholder="Ligue 1"
                      autofocus
                      inputmode="text"
                      name="tournoiNewName"
                      onKeyDown={(ev: KeyboardEvent) => this.onKeyPressNewName(ev)}
                      id={this.inputId}
                      type="text"
                    ></ion-input>
                  </ion-item>

                  <ion-item>
                    <ion-select id={`${this.selectTournamentTypeId}`} interface="action-sheet" placeholder="Quel sport ? (defaut: Foot ⚽️)">
                      <ion-select-option value={TournamentType.NBA}>
                        <ion-text color="dark">{TournamentTypeLabel.NBA}</ion-text>
                      </ion-select-option>
                      <ion-select-option value={TournamentType.RUGBY}>{TournamentTypeLabel.RUGBY}</ion-select-option>
                      <ion-select-option value={TournamentType.NFL}>{TournamentTypeLabel.NFL}</ion-select-option>
                      <ion-select-option value={TournamentType.BASKET}>{TournamentTypeLabel.BASKET}</ion-select-option>
                      <ion-select-option value={TournamentType.FOOT}>{TournamentTypeLabel.FOOT}</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <ion-button onClick={() => this.addTournament()} expand="full" disabled={!this.isNewTournamentNameReady}>
                    <mad-icon slot="start" name="math-plus" m dark></mad-icon>
                    Ajouter
                  </ion-button>

                  <ion-button
                    onClick={() => {
                      this.hideUiAddingTournament();
                    }}
                    expand="full"
                    color="secondary"
                  >
                    <mad-icon slot="start" name="math-minus" m dark></mad-icon>
                    Annuler
                  </ion-button>
                </div>
              ) : (
                <div>
                  <ion-button
                    color="primary"
                    onClick={() => {
                      this.displayUiAddingTournament();
                    }}
                    expand="full"
                  >
                    <mad-icon slot="start" name="math-plus" m></mad-icon>
                    Nouveau tournoi
                  </ion-button>
                </div>
              )}
            </ion-card-content>
          </ion-card>
        </ion-content>
      </Fragment>
    );
  }
}
