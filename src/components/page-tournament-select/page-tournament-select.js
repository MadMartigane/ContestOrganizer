import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { getTournaments } from "../../modules/init.js";
import {
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";
import pageTournamentSelectStyles from "./page-tournament-select.css?raw";
/**
 * PageTournamentSelect - Tournament selection page component
 * @element page-tournament-select
 */
export class PageTournamentSelect extends BaseElement {
  // DOM references
  domSelect = null;
  domTournamentName = null;
  /**
   * Sets up component properties and initializes signals
   */
  _setupProperties() {
    // Initialize tournaments FIRST, before any usage
    this.tournaments = getTournaments();
    // Initialize signals
    this._uiAddingTournament = new Signal(false);
    this._numberOfTournaments = new Signal(this.tournaments.length);
    this._isNewTournamentNameReady = new Signal(false);
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
    // Mark initialization as complete to enable rendering
    this._initialized = true;
  }
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(pageTournamentSelectStyles);
    this._injectStyles(sheet);
  }
  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  /**
   * Handle tournament card click - navigate to tournament
   */
  _selectTournament(id) {
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
  _createNewTournament() {
    this.displayUiAddingTournament();
  }
  /**
   * Cancel selection - hide add form
   */
  _cancelSelection() {
    this.hideUiAddingTournament();
  }
  /**
   * Confirm selection - add new tournament
   */
  _confirmSelection() {
    this.addTournament();
  }
  /**
   * Handle keydown on name input
   */
  _handleNameInputKeydown(event) {
    this.onKeyPressNewName(event);
  }
  /**
   * Delete tournament
   */
  async _deleteTournament(id) {
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
  async removeTournament(id) {
    this._numberOfTournaments.value = await this.tournaments.remove(id);
  }
  /**
   * Get the new tournament name value from input
   */
  getNewTournamentNameValue() {
    return this.domTournamentName?.value ?? null;
  }
  /**
   * Get tournament type selection
   */
  getTournamentTypeSelection() {
    const selection = this.domSelect?.value;
    return selection || TournamentType.NBA;
  }
  /**
   * Add a new tournament
   */
  async addTournament() {
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
  _updateConfirmButtonState() {
    const confirmBtn = this._renderRoot.querySelector(".confirm-add-btn");
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
  onKeyPressNewName(event) {
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
  hideUiAddingTournament() {
    this._uiAddingTournament.value = false;
  }
  /**
   * Display the add tournament form
   */
  displayUiAddingTournament() {
    this._uiAddingTournament.value = true;
    this._isNewTournamentNameReady.value = false;
  }
  _getStyles() {
    return html`
      <style>
        .page-tournament-select { display: block; }
      </style>
    `;
  }
  /**
   * Render the add tournament form
   */
  renderAddTournament() {
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
  renderNewTournamentButton() {
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
  renderTournamentList() {
    const tournamentList = this.tournaments.map((t) => t);
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
              @click=${(e) => {
                const target = e.target;
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
                  @click=${(e) => {
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
  renderNoTournamentInfo() {
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
  _renderContent() {
    const uiAddingTournament = this._uiAddingTournament.value;
    const numberOfTournaments = this._numberOfTournaments.value;
    return html`
      ${this._getStyles()}
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
  _render() {
    this._renderTemplate(this._renderContent());
    // Query DOM elements after render
    const addForm = this._renderRoot.querySelector(".add-tournament-form");
    if (addForm) {
      this.domTournamentName = addForm.querySelector("mad-input");
      this.domSelect = addForm.querySelector("mad-select");
    }
  }
}
customElements.define("page-tournament-select", PageTournamentSelect);
