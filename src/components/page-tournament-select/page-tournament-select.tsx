import type SlInput from "@shoelace-style/shoelace/dist/components/input/input.component";
import type SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component";
import type SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component";
import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component";
import { Component, Host, h, State } from "@stencil/core";
import tournaments from "../../modules/tournaments/tournaments";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";

@Component({
  tag: "page-tournament-select",
  styleUrl: "page-tournament-select.css",
  shadow: false,
})
export class PageTournamentSelect {
  private readonly tournaments: typeof tournaments;

  private domSelect: SlSelect;
  private domTournamentList: SlMenu;
  private domTournamentName: SlInput;
  private uiAddingTournamentJustOpened = false;

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

  componentDidRender() {
    Utils.installEventHandler(
      this.domTournamentList,
      "sl-select",
      (ev: CustomEvent) => {
        this.goPageTournament(ev);
      }
    );

    if (this.uiAddingTournamentJustOpened) {
      Utils.setFocus(this.domTournamentName as unknown as HTMLElement);
      this.uiAddingTournamentJustOpened = false;
    }
  }

  private goPageTournament(ev: CustomEvent) {
    const detail = ev.detail as { item: SlMenuItem };
    const tournamentId = detail.item.dataset.tournamentId;
    if (!tournamentId) {
      throw new Error(
        "<page-tournament-select> Unable to navigate to tournament page, missing tournament id."
      );
    }

    window.location.hash = `#/tournament/${tournamentId}`;
  }

  private async confirmRemoveTournament(event: Event, id: number) {
    event.preventDefault();
    event.stopPropagation();

    const tournament = await this.tournaments.get(id);
    const confirm = await Utils.confirmChoice(
      `Supprimer le tournoi: ${tournament?.name}?`
    );
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

  private onKeyPressNewName(event: KeyboardEvent) {
    const value = this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    if (value.length < 3) {
      this.isNewTournamentNameReady = false;
      return;
    }

    this.isNewTournamentNameReady = true;

    if (event.key === "Enter") {
      this.addTournament();
    }

    if (event.key === "ArrowDown") {
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
          autofocus
          class="my-4"
          label="Nom du tournois"
          minLength="2"
          name="tournoiNewName"
          onKeyDown={(ev: KeyboardEvent) => this.onKeyPressNewName(ev)}
          placeholder="Playoff"
          ref={(el: SlInput) => {
            this.domTournamentName = el;
          }}
          size="large"
        />

        <div>
          <sl-select
            help-text="(defaut: Foot ⚽️)"
            label="Quel sport ? "
            placeholder="Basket, NBA, Foot, …"
            ref={(el: SlSelect) => {
              this.domSelect = el;
            }}
            size="large"
          >
            <sl-option value={TournamentType.NBA}>
              {TournamentTypeLabel.NBA}
            </sl-option>
            <sl-option value={TournamentType.RUGBY}>
              {TournamentTypeLabel.RUGBY}
            </sl-option>
            <sl-option value={TournamentType.NFL}>
              {TournamentTypeLabel.NFL}
            </sl-option>
            <sl-option value={TournamentType.BASKET}>
              {TournamentTypeLabel.BASKET}
            </sl-option>
            <sl-option value={TournamentType.FOOT}>
              {TournamentTypeLabel.FOOT}
            </sl-option>
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
            <sl-icon class="class-2xl" name="dash-lg" slot="prefix" />
            Annuler
          </sl-button>

          <sl-button
            disabled={!this.isNewTournamentNameReady}
            onclick={() => this.addTournament()}
            size="large"
            variant="primary"
          >
            <sl-icon class="class-2xl" name="plus-lg" slot="prefix" />
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
          onclick={() => {
            this.displayUiAddingTournament();
          }}
          size="large"
          variant="primary"
        >
          <sl-icon class="class-2xl" name="plus-lg" slot="prefix" />
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
                {tournament.name} -{" "}
                {this.tournaments.getTournamentTypeLabel(tournament.type)}
              </span>
              <sl-badge pill variant="neutral">
                {tournament.grid.length}
              </sl-badge>
            </span>

            <span slot="suffix">
              <sl-icon
                class="container-s text-2xl text-warning"
                name="trash3"
                onclick={(ev: Event) =>
                  this.confirmRemoveTournament(ev, tournament.id)
                }
              />
              <sl-icon
                class="container-s text-2xl text-neutral"
                name="arrow-right-circle"
              />
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
          <sl-icon class="text-3xl text-warning" name="trophy" /> Pas encore de
          tournois <sl-icon class="text-2xl text-success" name="dribbble" />
        </h1>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <sl-breadcrumb>
          <sl-breadcrumb-item href="#/home">
            <sl-icon class="text-2xl" name="house" />
          </sl-breadcrumb-item>
          <sl-breadcrumb-item>
            <sl-icon class="text-2xl" name="trophy" />
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <div class="page-content">
          {this.numberOfTournaments
            ? this.renderTournamentList()
            : this.renderNoTournamentInfo()}

          <sl-divider />

          {this.uiAddingTournament
            ? this.renderAddTournament()
            : this.renderNewTournamentButton()}
        </div>
      </Host>
    );
  }
}
