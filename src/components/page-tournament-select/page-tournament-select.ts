import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { getTournaments } from "../../modules/init.js";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";

/**
 * PageTournamentSelect - Tournament selection page component
 * @element page-tournament-select
 */
export class PageTournamentSelect extends BaseElement {
  // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
  private declare tournaments: ReturnType<typeof getTournaments>;

  // DOM references
  private domSelect: HTMLElement | null = null;
  private domTournamentList: HTMLElement | null = null;
  private domTournamentName: HTMLElement | null = null;
  private uiAddingTournamentJustOpened = false;

  // Signals for state
  private declare _uiAddingTournament: Signal<boolean>;
  private declare _numberOfTournaments: Signal<number>;
  private declare _isNewTournamentNameReady: Signal<boolean>;

  /**
   * Sets up component properties and initializes signals
   */
  protected _setupProperties(): void {
    // Initialize tournaments FIRST, before any usage
    this.tournaments = getTournaments();

    // Initialize signals
    this._uiAddingTournament = new Signal<boolean>(false);
    this._numberOfTournaments = new Signal<number>(this.tournaments.length);
    this._isNewTournamentNameReady = new Signal<boolean>(false);

    // Track signals for reactivity
    this._trackSignal(this._uiAddingTournament);
    this._trackSignal(this._numberOfTournaments);
    this._trackSignal(this._isNewTournamentNameReady);

    // Initialize from tournaments module
    if (this.tournaments.isBusy) {
      this.tournaments.isBusy.then(() => {
        this._numberOfTournaments.value = this.tournaments.length;
      });
    }

    // Listen for tournament updates
    this.tournaments.onUpdate(() => {
      // Force UI refresh
      this._numberOfTournaments.value = 0;
      setTimeout(() => {
        this._numberOfTournaments.value = this.tournaments.length;
      });
    });

    // Mark initialization as complete to enable rendering
    this._initialized = true;
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
  }

  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  /**
   * Sets up event listeners after render
   */
  protected _setupEvents(): void {
    // Tournament selection handler
    Utils.installEventHandler(
      this.domTournamentList,
      "wa-select",
      (ev: CustomEvent) => {
        this.goPageTournament(ev);
      }
    );

    // New tournament button
    const newTournamentBtn = this.querySelector(".new-tournament-btn");
    newTournamentBtn?.addEventListener("click", () => {
      this.displayUiAddingTournament();
    });

    // Cancel add button
    const cancelAddBtn = this.querySelector(".cancel-add-btn");
    cancelAddBtn?.addEventListener("click", () => {
      this.hideUiAddingTournament();
    });

    // Confirm add button
    const confirmAddBtn = this.querySelector(".confirm-add-btn");
    confirmAddBtn?.addEventListener("click", () => {
      this.addTournament();
    });

    // Name input keydown event
    const nameInput = this.querySelector(".add-tournament-form wa-input");
    if (nameInput) {
      nameInput.addEventListener("keydown", (ev: Event) => {
        this.onKeyPressNewName(ev as KeyboardEvent);
      });
    }

    // Delete tournament icons
    const deleteIcons = Array.from(
      this.querySelectorAll(".delete-tournament-icon")
    );
    for (const icon of deleteIcons) {
      icon.addEventListener("click", (ev: Event) => {
        const id = (icon as HTMLElement).dataset.tournamentId;
        if (id) {
          this.confirmRemoveTournament(ev, Number(id));
        }
      });
    }

    // Focus management when form opens
    if (this.uiAddingTournamentJustOpened) {
      Utils.setFocus(this.domTournamentName as HTMLElement);
      this.uiAddingTournamentJustOpened = false;
    }
  }

  /**
   * Navigate to selected tournament page
   */
  private goPageTournament(ev: CustomEvent): void {
    const detail = ev.detail as { item: HTMLElement };
    const tournamentId = detail.item.dataset.tournamentId;
    if (!tournamentId) {
      throw new Error(
        "<page-tournament-select> Unable to navigate to tournament page, missing tournament id."
      );
    }

    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { hash: `#/zone/planning/tournament/${tournamentId}` },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Confirm and remove a tournament
   */
  private async confirmRemoveTournament(
    event: Event,
    id: number
  ): Promise<void> {
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

  /**
   * Remove a tournament
   */
  private async removeTournament(id: number): Promise<void> {
    this._numberOfTournaments.value = await this.tournaments.remove(id);
  }

  /**
   * Get the new tournament name value from input
   */
  private getNewTournamentNameValue(): string | null {
    const inputEl = this.domTournamentName as { value?: string } | null;
    return inputEl?.value ?? null;
  }

  /**
   * Get tournament type selection
   */
  private getTournamentTypeSelection(): TournamentType {
    const selectEl = this.domSelect as { value?: string } | null;
    const selection = selectEl?.value as TournamentType | undefined;
    return selection || TournamentType.FOOT;
  }

  /**
   * Add a new tournament
   */
  private async addTournament(): Promise<void> {
    const value = this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    const currentTournamentTypeSelected = this.getTournamentTypeSelection();

    this._numberOfTournaments.value = await this.tournaments.add({
      name: value,
      grid: [],
      matchs: [],
      type: currentTournamentTypeSelected,
    });

    this._uiAddingTournament.value = false;
  }

  /**
   * Handle key press on new tournament name input
   */
  private onKeyPressNewName(event: KeyboardEvent): void {
    const value = this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    if (value.length < 3) {
      this._isNewTournamentNameReady.value = false;
      return;
    }

    this._isNewTournamentNameReady.value = true;

    if (event.key === "Enter") {
      this.addTournament();
    }

    if (event.key === "ArrowDown" && this.domSelect) {
      Utils.setFocus(this.domSelect);
    }
  }

  /**
   * Hide the add tournament form
   */
  private hideUiAddingTournament(): void {
    this._uiAddingTournament.value = false;
  }

  /**
   * Display the add tournament form
   */
  private displayUiAddingTournament(): void {
    this._uiAddingTournament.value = true;
    this._isNewTournamentNameReady.value = false;
    this.uiAddingTournamentJustOpened = true;
  }

  /**
   * Renders the component's DOM
   */
  protected _render(): void {
    const uiAddingTournament = this._uiAddingTournament.value;
    const numberOfTournaments = this._numberOfTournaments.value;

    this.innerHTML = `
      <div class="page-content">
        ${numberOfTournaments > 0 ? this.renderTournamentList() : this.renderNoTournamentInfo()}

        <wa-divider></wa-divider>

        ${uiAddingTournament ? this.renderAddTournament() : this.renderNewTournamentButton()}
      </div>
    `;

    // Query DOM elements after render
    this.domTournamentList = this.querySelector("wa-menu");
    const addForm = this.querySelector(".add-tournament-form");
    if (addForm) {
      this.domTournamentName = addForm.querySelector(
        "wa-input"
      ) as HTMLElement | null;
      this.domSelect = addForm.querySelector("wa-select") as HTMLElement | null;
    }

    // Setup event handlers after render
    this._setupEvents();
  }

  /**
   * Render the add tournament form
   */
  private renderAddTournament(): string {
    const isNewTournamentNameReady = this._isNewTournamentNameReady.value;

    return `
      <wa-card class="card-common add-tournament-form">
        <wa-input
          autofocus
          class="my-4"
          label="Nom du tournois"
          minlength="2"
          name="tournoiNewName"
          placeholder="Playoff"
          role="textbox"
          size="large"
        ></wa-input>

        <div>
          <wa-select
            help-text="(defaut: Foot ⚽️)"
            label="Quel sport ? "
            placeholder="Basket, NBA, Foot, …"
            size="large"
          >
            <wa-option value="${TournamentType.NBA}">${TournamentTypeLabel.NBA}</wa-option>
            <wa-option value="${TournamentType.RUGBY}">${TournamentTypeLabel.RUGBY}</wa-option>
            <wa-option value="${TournamentType.NFL}">${TournamentTypeLabel.NFL}</wa-option>
            <wa-option value="${TournamentType.BASKET}">${TournamentTypeLabel.BASKET}</wa-option>
            <wa-option value="${TournamentType.FOOT}">${TournamentTypeLabel.FOOT}</wa-option>
          </wa-select>
        </div>

        <div slot="footer">
          <wa-button
            class="cancel-add-btn"
            size="large"
            variant="warning"
          >
            <wa-icon class="text-2xl" name="minus" slot="start"></wa-icon>
            Annuler
          </wa-button>

          <wa-button
            class="confirm-add-btn"
            ${isNewTournamentNameReady ? "" : "disabled"}
            size="large"
            variant="brand"
          >
            <wa-icon class="text-2xl" name="plus" slot="start"></wa-icon>
            Ajouter
          </wa-button>
        </div>
      </wa-card>
    `;
  }

  /**
   * Render the new tournament button
   */
  private renderNewTournamentButton(): string {
    return `
      <wa-card class="card-common">
        <wa-button
          class="new-tournament-btn"
          size="large"
          variant="brand"
        >
          <wa-icon class="text-2xl" name="plus" slot="start"></wa-icon>
          Nouveau tournoi
        </wa-button>
      </wa-card>
    `;
  }

  /**
   * Render the tournament list
   */
  private renderTournamentList(): string {
    return `
      <wa-menu>
        ${this.tournaments
          .map(
            (tournament: Tournament) => `
          <wa-menu-item data-tournament-id="${tournament.id}">
            <span slot="start">
              <span class="container-s">
                ${tournament.name} -
                ${this.tournaments.getTournamentTypeLabel(tournament.type)}
              </span>
              <wa-tag pill variant="neutral">
                ${tournament.grid.length}
              </wa-tag>
            </span>

            <span slot="suffix">
              <wa-icon
                class="delete-tournament-icon container-s text-2xl text-warning"
                data-tournament-id="${tournament.id}"
                name="trash3"
              ></wa-icon>
              <wa-icon
                class="container-s text-2xl text-neutral"
                name="arrow-right-circle"
              ></wa-icon>
            </span>
          </wa-menu-item>
        `
          )
          .join("")}
      </wa-menu>
    `;
  }

  /**
   * Render message when no tournaments exist
   */
  private renderNoTournamentInfo(): string {
    return `
      <div class="text-center">
        <h1>
          <wa-icon class="text-3xl text-warning" name="trophy"></wa-icon>
          Pas encore de tournois
          <wa-icon class="text-2xl text-success" name="dribbble"></wa-icon>
        </h1>
      </div>
    `;
  }
}

customElements.define("page-tournament-select", PageTournamentSelect);
