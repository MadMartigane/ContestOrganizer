import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { getTournaments } from "../../modules/init.js";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";
import "./page-tournament-select.css";

/**
 * PageTournamentSelect - Tournament selection page component
 * @element page-tournament-select
 */
export class PageTournamentSelect extends BaseElement {
  // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
  private declare tournaments: ReturnType<typeof getTournaments>;

  // DOM references
  private domSelect: HTMLElement | null = null;
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
    // Card click → navigate to tournament
    const tournamentCards = Array.from(
      this.querySelectorAll(".tournament-card")
    );
    for (const card of tournamentCards) {
      card.addEventListener("click", (ev: Event) => {
        const target = ev.target as HTMLElement;
        // Don't navigate if clicking the delete icon
        if (target.closest(".delete-tournament-icon")) {
          return;
        }
        const id = (card as HTMLElement).dataset.tournamentId;
        if (id) {
          this.dispatchEvent(
            new CustomEvent("navigate", {
              detail: { hash: `#/tournament/${id}` },
              bubbles: true,
              composed: true,
            })
          );
        }
      });
    }

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
    const nameInput = this.querySelector(".add-tournament-form mad-input");
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
        ev.stopPropagation(); // Prevent card click navigation
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
    return selection || TournamentType.NBA;
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
   * Update the confirm button disabled state directly via DOM
   * without triggering a full re-render
   */
  private _updateConfirmButtonState(): void {
    const confirmBtn = this.querySelector(
      ".confirm-add-btn"
    ) as HTMLElement | null;
    if (confirmBtn) {
      const isReady = this._isNewTournamentNameReady.value;
      if (isReady) {
        confirmBtn.removeAttribute("disabled");
      } else {
        confirmBtn.setAttribute("disabled", "");
      }
    }
  }

  /**
   * Handle key press on new tournament name input
   */
  private onKeyPressNewName(event: KeyboardEvent): void {
    const value = this.getNewTournamentNameValue();
    if (!value) {
      return;
    }

    // Update signal for state tracking (not tracked, so no re-render)
    this._isNewTournamentNameReady.value = value.length >= 3;

    // Direct DOM update for button state
    this._updateConfirmButtonState();

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
      <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
        ${numberOfTournaments > 0 ? this.renderTournamentList() : this.renderNoTournamentInfo()}

        <hr class="my-4 border-neutral-200 dark:border-neutral-700">

        ${uiAddingTournament ? this.renderAddTournament() : this.renderNewTournamentButton()}
      </div>
    `;

    // Query DOM elements after render
    // (no longer need domTournamentList since we removed wa-menu)
    const addForm = this.querySelector(".add-tournament-form");
    if (addForm) {
      this.domTournamentName = addForm.querySelector(
        "mad-input"
      ) as HTMLElement | null;
      this.domSelect = addForm.querySelector(
        "mad-select"
      ) as HTMLElement | null;
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
      <mad-card class="add-tournament-form">
        <mad-input
          autofocus
          class="my-4"
          label="Nom du tournois"
          minlength="2"
          name="tournoiNewName"
          placeholder="Playoff"
          role="textbox"
          size="large"
        ></mad-input>

        <div>
          <mad-select
            help-text="(defaut: NBA 🏀)"
            label="Quel sport ? "
            placeholder="Basket, NBA, Foot, …"
            size="large"
          >
            <mad-option value="${TournamentType.NBA}">${TournamentTypeLabel.NBA}</mad-option>
            <mad-option value="${TournamentType.RUGBY}">${TournamentTypeLabel.RUGBY}</mad-option>
            <mad-option value="${TournamentType.NFL}">${TournamentTypeLabel.NFL}</mad-option>
            <mad-option value="${TournamentType.BASKET}">${TournamentTypeLabel.BASKET}</mad-option>
            <mad-option value="${TournamentType.FOOT}">${TournamentTypeLabel.FOOT}</mad-option>
          </mad-select>
        </div>

        <div slot="footer">
          <mad-button
            class="cancel-add-btn"
            size="large"
            variant="warning"
          >
            <mad-icon class="text-2xl" name="minus" slot="start"></mad-icon>
            Annuler
          </mad-button>

          <mad-button
            class="confirm-add-btn"
            ${isNewTournamentNameReady ? "" : "disabled"}
            size="large"
            variant="brand"
          >
            <mad-icon class="text-2xl" name="plus" slot="start"></mad-icon>
            Ajouter
          </mad-button>
        </div>
      </mad-card>
    `;
  }

  /**
   * Render the new tournament button
   */
  private renderNewTournamentButton(): string {
    return `
      <mad-card>
        <mad-button
          class="new-tournament-btn"
          size="large"
          variant="brand"
        >
          <mad-icon class="text-2xl" name="plus" slot="start"></mad-icon>
          Nouveau tournoi
        </mad-button>
      </mad-card>
    `;
  }

  /**
   * Render the tournament list
   */
  private renderTournamentList(): string {
    return `
      <div class="tournament-grid">
        ${this.tournaments
          .map(
            (tournament: Tournament) => `
          <mad-card
            class="tournament-card"
            data-tournament-id="${tournament.id}"
            clickable
          >
            <div class="tournament-card-body">
              <div class="tournament-card-header">
                <span class="tournament-name">${tournament.name}</span>
                <mad-badge pill variant="neutral">
                  ${this.tournaments.getTournamentTypeLabel(tournament.type)}
                </mad-badge>
              </div>
              <div class="tournament-card-meta">
                <mad-icon name="trophy" class="meta-icon"></mad-icon>
                <span>${tournament.grid.length} équipe${tournament.grid.length === 1 ? "" : "s"}</span>
                <mad-icon name="controller" class="meta-icon"></mad-icon>
                <span>${tournament.matchs.length} match${tournament.matchs.length === 1 ? "" : "s"}</span>
              </div>
            </div>
            <div slot="footer" class="tournament-card-footer">
              <mad-icon
                class="delete-tournament-icon text-xl text-yellow-600"
                data-tournament-id="${tournament.id}"
                name="trash3"
                label="Supprimer"
              ></mad-icon>
              <mad-icon
                class="text-xl text-neutral-400 dark:text-neutral-500"
                name="arrow-right-circle"
              ></mad-icon>
            </div>
          </mad-card>
        `
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Render message when no tournaments exist
   */
  private renderNoTournamentInfo(): string {
    return `
      <div class="text-center">
        <h1>
          <mad-icon class="text-3xl text-yellow-600" name="trophy"></mad-icon>
          Pas encore de tournois
          <mad-icon class="text-2xl text-green-600" name="dribbble"></mad-icon>
        </h1>
      </div>
    `;
  }
}

customElements.define("page-tournament-select", PageTournamentSelect);
