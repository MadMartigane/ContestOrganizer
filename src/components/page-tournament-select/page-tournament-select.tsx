import { Component, h, Host, State } from '@stencil/core';
import { Tournament, TournamentType, TournamentTypeLabel } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import uuid from '../../modules/uuid/uuid';
import Utils from '../../modules/utils/utils';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.component';
import SlMenu from '@shoelace-style/shoelace/dist/components/menu/menu.component';
import SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.component';

@Component({
  tag: 'page-tournament-select',
  styleUrl: 'page-tournament-select.css',
  shadow: false,
})
export class PageTournamentSelect {
  private readonly tournaments: typeof tournaments;
  private readonly inputId: string;
  private readonly uuid: typeof uuid;

  private domSelect: SlSelect;
  private domTournamentList: SlMenu;

  @State() private uiAddingTournament: boolean;
  @State() private numberOfTournaments: number;
  @State() private isNewTournamentNameReady: boolean;

  constructor() {
    this.tournaments = tournaments;
    this.uuid = uuid;
    this.inputId = 'pnii_' + this.uuid.new();

    this.uiAddingTournament = false;

    if (this.tournaments.isBusy) {
      this.numberOfTournaments = 0;
      this.tournaments.isBusy.then(() => {
        this.numberOfTournaments = this.tournaments.length;
      });
    } else {
      this.numberOfTournaments = this.tournaments.length;
    }

    this.numberOfTournaments = this.tournaments.length;

    this.tournaments.onUpdate(() => {
      /* Force the UI to refresh, even if the numberOfTournaments have not changed */
      this.numberOfTournaments = 0;
      setTimeout(() => {
        this.numberOfTournaments = this.tournaments.length;
      });
    });
  }

  public componentDidRender() {
    if (this.domTournamentList && !this.domTournamentList.dataset.madHandled) {
      this.domTournamentList.addEventListener('sl-select', (ev: CustomEvent) => {
        this.goPageTournament(ev);
      });

      this.domTournamentList.dataset.madHandled = 'true';
    }
  }

  private goPageTournament(ev: CustomEvent) {
    const detail = ev.detail as { item: SlMenuItem };
    const tournamentId = detail.item.dataset.tournamentId;
    if (!tournamentId) {
      throw new Error('<page-tournament-select> Unable to navigate to tournament page, missing tournament id.');
    }

    window.location.hash = `#/tournament/${tournamentId}`;
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

  private gitTournamentTypeSelection(): TournamentType {
    const selection = this.domSelect.value as TournamentType;
    return selection || TournamentType.FOOT;
  }

  private async addTournament() {
    const value = await this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    const currentTournamentTypeSelected = this.gitTournamentTypeSelection();

    this.numberOfTournaments = await this.tournaments.add({
      name: value,
      grid: [],
      matchs: [],
      type: currentTournamentTypeSelected,
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
    this.isNewTournamentNameReady = false;

    Utils.setFocus(`ion-input#${this.inputId}`);
  }

  private renderAddTournament() {
    return (
      <sl-card class="card-common">
        <div slot="header" class="container">
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
        </div>

        <div class="container">
          <sl-select
            label="Quel sport ? "
            ref={(el: SlSelect) => {
              this.domSelect = el;
            }}
            size="large"
            help-text="(defaut: Foot ⚽️)"
            placeholder="Basket, NBA, Foot, …"
          >
            <sl-option value={TournamentType.NBA}>{TournamentTypeLabel.NBA}</sl-option>
            <sl-option value={TournamentType.RUGBY}>{TournamentTypeLabel.RUGBY}</sl-option>
            <sl-option value={TournamentType.NFL}>{TournamentTypeLabel.NFL}</sl-option>
            <sl-option value={TournamentType.BASKET}>{TournamentTypeLabel.BASKET}</sl-option>
            <sl-option value={TournamentType.FOOT}>{TournamentTypeLabel.FOOT}</sl-option>
          </sl-select>
        </div>

        <div slot="footer">
          <sl-button
            onclick={() => {
              this.hideUiAddingTournament();
            }}
            size="large"
            variant="neutral"
          >
            <sl-icon slot="prefix" name="dash-lg" class="xl"></sl-icon>
            Annuler
          </sl-button>

          <sl-button onclick={() => this.addTournament()} size="large" variant="primary" disabled={!this.isNewTournamentNameReady}>
            <sl-icon slot="prefix" name="plus-lg" class="xl"></sl-icon>
            Ajouter
          </sl-button>
        </div>
      </sl-card>
    );
  }

  private renderNewTournamentButton() {
    return (
      <sl-card class="card-common">
        <sl-button
          variant="primary"
          onclick={() => {
            this.displayUiAddingTournament();
          }}
          size="large"
        >
          <sl-icon slot="prefix" name="plus-lg" class="xl"></sl-icon>
          Nouveau tournoi
        </sl-button>
      </sl-card>
    );
  }

  private renderTournamentList() {
    return (
      <sl-menu
        ref={(el: SlMenu) => {
          this.domTournamentList = el;
        }}
      >
        {this.tournaments.map((tournament: Tournament) => (
          <sl-menu-item data-tournament-id={tournament.id}>
            <span slot="prefix">
              <span class="container-s">
                {tournament.name} - {this.tournaments.getTournamentTypeLabel(tournament.type)}
              </span>
              <sl-badge variant="neutral" pill>
                {tournament.grid.length}
              </sl-badge>
            </span>

            <span slot="suffix">
              <sl-icon class="warning xl container-s" onclick={(ev: Event) => this.confirmRemoveTournament(ev, tournament.id)} name="trash3"></sl-icon>
              <sl-icon class="neutral xl container-s" name="arrow-right-circle"></sl-icon>
            </span>
          </sl-menu-item>
        ))}
      </sl-menu>
    );
  }

  private renderNoTournamentInfo() {
    return (
      <div class="sl-text-center">
        <h1>
          <sl-icon name="trophy" class="xl warning"></sl-icon> Pas encore de tournois <sl-icon name="dribbble" class="xl success"></sl-icon>
        </h1>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon name="house" class="xl"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon name="trophy" class="xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <ion-content class="ion-padding">
          {this.numberOfTournaments ? this.renderTournamentList() : this.renderNoTournamentInfo()}

          <sl-divider></sl-divider>

          {this.uiAddingTournament ? this.renderAddTournament() : this.renderNewTournamentButton()}
        </ion-content>
      </Host>
    );
  }
}
