import { BaseElement } from "@core/base-element";
import { Signal } from "@core/signal";
import { createComponentSheet } from "@core/styles";
import { html, type TemplateResult } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { getTournaments } from "../../modules/init";
import {
  type Tournament,
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types";
import Utils from "../../modules/utils/utils";
import pageTournamentSelectStyles from "./page-tournament-select.css?raw";

const pageTournamentSelectSheet = createComponentSheet(
  pageTournamentSelectStyles
);

/**
 * PageTournamentSelect - Tournament selection and creation page
 *
 * Observed attributes: none
 *
 * Custom events:
 * - `navigate`: Fired when navigating to a tournament, detail: { hash: string }
 *
 * @element page-tournament-select
 */
export class PageTournamentSelect extends BaseElement {
  // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
  private declare tournaments: ReturnType<typeof getTournaments>;

  // DOM references
  private domSelect: HTMLSelectElement | null = null;
  private domTournamentName: HTMLInputElement | null = null;

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
    // Note: _isNewTournamentNameReady is NOT tracked - button state is updated directly via DOM

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

    // _initialized is set automatically by BaseElement after this method returns
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

  protected _injectStyles(): void {
    super._injectStyles(pageTournamentSelectSheet);
  }

  /**
   * Handle tournament card click - navigate to tournament
   */
  private _selectTournament(id: number): void {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { hash: `#/tournament/${id}` },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Create new tournament - show add form
   */
  private _createNewTournament(): void {
    this.displayUiAddingTournament();
  }

  /**
   * Cancel selection - hide add form
   */
  private _cancelSelection(): void {
    this.hideUiAddingTournament();
  }

  /**
   * Confirm selection - add new tournament
   */
  private _confirmSelection(): void {
    this.addTournament();
  }

  /**
   * Handle keydown on name input
   */
  private _handleNameInputKeydown(event: KeyboardEvent): void {
    this.onKeyPressNewName(event);
  }

  /**
   * Delete tournament
   */
  private async _deleteTournament(id: number): Promise<void> {
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
    return this.domTournamentName?.value ?? null;
  }

  /**
   * Get tournament type selection
   */
  private getTournamentTypeSelection(): TournamentType {
    const selection = this.domSelect?.value as TournamentType | undefined;
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
    const confirmBtn = this._renderRoot.querySelector(
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
  }

  /**
   * Render the add tournament form
   */
  private renderAddTournament(): TemplateResult {
    const isNewTournamentNameReady = this._isNewTournamentNameReady.value;

    return html`
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
          @keydown=${this._handleNameInputKeydown}
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
            @click=${this._cancelSelection}
          >
            <mad-icon class="text-2xl" name="minus" slot="start"></mad-icon>
            Annuler
          </mad-button>

          <mad-button
            class="confirm-add-btn"
            ?disabled=${!isNewTournamentNameReady}
            size="large"
            variant="brand"
            @click=${this._confirmSelection}
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
  private renderNewTournamentButton(): TemplateResult {
    return html`
      <mad-card>
        <mad-button
          class="new-tournament-btn"
          size="large"
          variant="brand"
          @click=${this._createNewTournament}
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
  private renderTournamentList(): TemplateResult {
    const tournamentList = this.tournaments.map((t) => t) as Tournament[];
    return html`
      <div class="tournament-grid">
        ${repeat(
          tournamentList,
          (t) => t.id,
          (tournament) => html`
            <mad-card
              class="tournament-card"
              data-tournament-id="${tournament.id}"
              clickable
              @click=${(e: Event) => {
                const target = e.target as HTMLElement;
                if (target.closest(".delete-tournament-icon")) {
                  return;
                }
                this._selectTournament(tournament.id);
              }}
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
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._deleteTournament(tournament.id);
                  }}
                ></mad-icon>
                <mad-icon
                  class="text-xl text-neutral-400 dark:text-neutral-500"
                  name="arrow-right-circle"
                ></mad-icon>
              </div>
            </mad-card>
          `
        )}
      </div>
    `;
  }

  /**
   * Render message when no tournaments exist
   */
  private renderNoTournamentInfo(): TemplateResult {
    return html`
      <div class="text-center">
        <h1>
          <mad-icon class="text-3xl text-yellow-600" name="trophy"></mad-icon>
          Pas encore de tournois
          <mad-icon class="text-2xl text-green-600" name="dribbble"></mad-icon>
        </h1>
      </div>
    `;
  }

  private _renderContent(): TemplateResult {
    const uiAddingTournament = this._uiAddingTournament.value;
    const numberOfTournaments = this._numberOfTournaments.value;

    return html`
      <div class="page-tournament-select">
        <div part="base">
          <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
            ${numberOfTournaments > 0 ? this.renderTournamentList() : this.renderNoTournamentInfo()}

            <hr class="my-4 border-neutral-200 dark:border-neutral-700">

            ${uiAddingTournament ? this.renderAddTournament() : this.renderNewTournamentButton()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the component's DOM
   */
  protected _render(): void {
    this._renderTemplate(this._renderContent());

    // Query DOM elements after render
    const addForm = this._renderRoot.querySelector(".add-tournament-form");
    if (addForm) {
      this.domTournamentName = addForm.querySelector(
        "mad-input"
      ) as HTMLInputElement | null;
      this.domSelect = addForm.querySelector(
        "mad-select"
      ) as HTMLSelectElement | null;
    }
  }
}

customElements.define("page-tournament-select", PageTournamentSelect);
