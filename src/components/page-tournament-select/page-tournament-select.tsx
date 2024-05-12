import { Component, h, Host, State } from '@stencil/core';
import { Tournament, TournamentType, TournamentTypeLabel } from '../../modules/tournaments/tournaments.types';
import tournaments from '../../modules/tournaments/tournaments';
import Utils from '../../modules/utils/utils';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.component';
import SlMenu from '@shoelace-style/shoelace/dist/components/menu/menu.component';
import SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.component';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component';

@Component({
  tag: 'page-tournament-select',
  styleUrl: 'page-tournament-select.css',
  shadow: false,
})
export class PageTournamentSelect {
  private readonly tournaments: typeof tournaments;

  private domSelect: SlSelect;
  private domTournamentList: SlMenu;
  private domTournamentName: SlInput;
  private uiAddingTournamentJustOpened: boolean = false;

  @State() private uiAddingTournament: boolean;
  @State() private numberOfTournaments: number;
  @State() private isNewTournamentNameReady: boolean;

  constructor() {
    this.tournaments = tournaments;

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
    Utils.installEventHandler(this.domTournamentList, 'sl-select', (ev: CustomEvent) => {
      this.goPageTournament(ev);
    });

    if (this.uiAddingTournamentJustOpened) {
      Utils.setFocus(this.domTournamentName);
      this.uiAddingTournamentJustOpened = false;
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

  private getNewTournamentNameValue(): string | null {
    return this.domTournamentName.value;
  }

  private gitTournamentTypeSelection(): TournamentType {
    const selection = this.domSelect.value as TournamentType;
    return selection || TournamentType.FOOT;
  }

  private async addTournament() {
    const value = this.getNewTournamentNameValue();
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
    const value = this.getNewTournamentNameValue();
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

    if (event.key === 'ArrowDown') {
      Utils.setFocus(this.domSelect);
    }
  }

  private hideUiAddingTournament() {
    this.uiAddingTournament = false;
  }

  private displayUiAddingTournament() {
    this.uiAddingTournament = true;
    this.isNewTournamentNameReady = false;

    this.uiAddingTournamentJustOpened = true;
  }

  private renderAddTournament() {
    return (
      <sl-card class="card-common">
        <sl-input
          size="large"
          class="my-4"
          label="Nom du tournois"
          placeholder="Playoff"
          autofocus
          minLength="2"
          name="tournoiNewName"
          onKeyDown={(ev: KeyboardEvent) => this.onKeyPressNewName(ev)}
          ref={(el: SlInput) => {
            this.domTournamentName = el;
          }}
        ></sl-input>

        <div>
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
            variant="warning"
          >
            <sl-icon slot="prefix" name="dash-lg" class="class-2xl"></sl-icon>
            Annuler
          </sl-button>

          <sl-button onclick={() => this.addTournament()} size="large" variant="primary" disabled={!this.isNewTournamentNameReady}>
            <sl-icon slot="prefix" name="plus-lg" class="class-2xl"></sl-icon>
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
          <sl-icon slot="prefix" name="plus-lg" class="class-2xl"></sl-icon>
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
              <sl-icon class="text-warning text-2xl container-s" onclick={(ev: Event) => this.confirmRemoveTournament(ev, tournament.id)} name="trash3"></sl-icon>
              <sl-icon class="text-neutral text-2xl container-s" name="arrow-right-circle"></sl-icon>
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
          <sl-icon name="trophy" class="text-3xl text-warning"></sl-icon> Pas encore de tournois <sl-icon name="dribbble" class="text-2xl text-success"></sl-icon>
        </h1>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon name="house" class="text-2xl"></sl-icon>
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon name="trophy" class="text-2xl"></sl-icon>
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          {this.numberOfTournaments ? this.renderTournamentList() : this.renderNoTournamentInfo()}

          <sl-divider></sl-divider>

          {this.uiAddingTournament ? this.renderAddTournament() : this.renderNewTournamentButton()}
        </div>
      </Host>
    );
  }
}
