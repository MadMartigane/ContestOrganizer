import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { html, nothing, render } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { getTournaments } from "../../modules/init.js";
import Matchs, {
  Match,
  MatchStatus,
  MatchTeamType,
} from "../../modules/matchs/matchs.js";
import {
  generateNBAScheduleMinimax,
  getNBAMissingMatchCount,
  validateNBAScheduleGeneration,
} from "../../modules/nba/nba.scheduler.js";
import { Tournaments } from "../../modules/tournaments/tournaments.js";
import {
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";
import { calculateTargetMatchIndex } from "./page-match.logic.js";
/**
 * PageMatch - Tournament match management page component
 * @element page-match
 * @fires navigate
 */
export class PageMatch extends BaseElement {
  config = {
    minGoal: 0,
  };
  // Property: tournament-id attribute
  _tournamentId = 0;
  // DOM references
  matchRefs = new Map();
  // Keyboard handler
  _handleKeydown = (e) => {
    // Alt+T = Top, Alt+B = Bottom, Alt+M = Match
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault();
          this._scrollToTop();
          break;
        case "b":
          e.preventDefault();
          this._scrollToBottom();
          break;
        case "m":
          e.preventDefault();
          this._scrollToCurrentMatch();
          break;
        default:
        // Ignore other keys
      }
    }
  };
  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes() {
    return ["tournament-id"];
  }
  /**
   * Tournament ID property
   */
  get tournamentId() {
    return this._tournamentId;
  }
  set tournamentId(value) {
    this.setAttribute("tournament-id", String(value));
  }
  /**
   * Gets the target match index for auto-scrolling
   */
  get targetMatchIndex() {
    return calculateTargetMatchIndex(this._tournament.value);
  }
  /**
   * Checks if NBA schedule is complete
   */
  get isNBAScheduleComplete() {
    const tournament = this._tournament.value;
    if (!tournament || tournament.type !== TournamentType.NBA) {
      return false;
    }
    return getNBAMissingMatchCount(tournament) === 0;
  }
  /**
   * Sets up component properties from attributes and initializes signals
   */
  _setupProperties() {
    // Initialize signals
    this._tournament = new Signal(null);
    this._uiError = new Signal(null);
    this._displayTeamSelector = new Signal(false);
    this._teamToSelect = new Signal(null);
    this._matchNumber = new Signal(0);
    this._currentMatch = new Signal(null);
    this._matchRefs = new Signal([]);
    // Initialize from attributes
    const tournamentIdAttr = this.getAttribute("tournament-id");
    this._tournamentId = tournamentIdAttr ? Number(tournamentIdAttr) : 0;
    // Track signals for reactivity
    this._trackSignal(this._tournament);
    this._trackSignal(this._uiError);
    this._trackSignal(this._displayTeamSelector);
    this._trackSignal(this._teamToSelect);
    this._trackSignal(this._matchNumber);
    this._trackSignal(this._currentMatch);
    this._trackSignal(this._matchRefs);
    // Mark initialization as complete to enable rendering
    this._initialized = true;
    // Setup keyboard shortcuts
    this._setupKeyboardShortcuts();
  }
  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this.initTournaments();
    this._setupScrollNavigation();
  }
  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    document.removeEventListener("keydown", this._handleKeydown);
    window.removeEventListener("scroll", this._handleScroll);
    super.disconnectedCallback();
  }
  /**
   * Handles attribute changes
   */
  _onAttributeChange(name, value) {
    if (name === "tournament-id") {
      this._tournamentId = value ? Number(value) : 0;
      this.initTournaments();
    }
  }
  /**
   * Initialize tournaments
   */
  async initTournaments() {
    // Migration: Using getTournaments() to get singleton instance shared between Stencil and Vanilla bundles
    const tournament = await getTournaments().get(this._tournamentId);
    if (!tournament) {
      this._uiError.value = `Tournois #${this._tournamentId} non trouvé.`;
      return 0;
    }
    // CLEAR ERROR ON SUCCESS - defense against stale error state
    this._uiError.value = null;
    this._tournament.value = tournament;
    this._matchNumber.value = tournament.matchs.length;
    this._autoScrollToMatch();
    return this.updateTournament();
  }
  /**
   * Update tournament in the system
   */
  updateTournament() {
    const tournament = this._tournament.value;
    if (!tournament) {
      return Promise.resolve(0);
    }
    return getTournaments().update(tournament);
  }
  /**
   * Open match creation dialog
   */
  goMatch() {
    this._displayTeamSelector.value = true;
    this._currentMatch.value = new Match();
    const tournament = this._tournament.value;
    if (tournament) {
      this._teamToSelect.value = Matchs.teamSortedByMatch(tournament);
    }
    this.resetRowStates();
  }
  /**
   * Auto-generate a match
   */
  async goAutoMatch() {
    const tournament = this._tournament.value;
    if (!tournament) {
      return;
    }
    const teams = Matchs.getAutoMatchTeams(tournament);
    if (!teams) {
      return;
    }
    const [hostId, visitorId] = teams;
    const match = new Match();
    match.hostId = hostId;
    match.visitorId = visitorId;
    if (!tournament.matchs) {
      tournament.matchs = [];
    }
    tournament.matchs.push(match);
    this._matchNumber.value = tournament.matchs.length;
    await this.updateTournament();
    this.refreshUI();
  }
  /**
   * Generate all NBA matches
   */
  async goGenerateAllNBAMatches() {
    const tournament = this._tournament.value;
    if (!tournament || tournament.type !== TournamentType.NBA) {
      return;
    }
    const validation = validateNBAScheduleGeneration(tournament);
    if (!validation.valid) {
      await Utils.alertChoice(validation.warnings.join("\n"));
      return;
    }
    const missingCount = getNBAMissingMatchCount(tournament);
    const confirmed = await Utils.confirmChoice(
      `Generate ${missingCount} matches to complete the season?`
    );
    if (!confirmed) {
      return;
    }
    const result = generateNBAScheduleMinimax(tournament);
    if (result.warnings.length > 0) {
      console.warn("NBA Schedule warnings:", result.warnings);
    }
    for (const match of result.matches) {
      tournament.matchs.push(match);
    }
    this._matchNumber.value = tournament.matchs.length;
    await this.updateTournament();
    this.refreshUI();
  }
  /**
   * Refresh UI hook to trigger re-renders
   */
  refreshUI() {
    this._requestRender();
  }
  /**
   * Update only the score display for a specific match without full re-render
   */
  updateMatchScore(index, match) {
    const matchTile = this._renderRoot.querySelector(
      `mad-match-tile[data-match-index="${index}"]`
    );
    if (matchTile) {
      matchTile.setAttribute("host-score", String(match.goals.host));
      matchTile.setAttribute("visitor-score", String(match.goals.visitor));
    }
  }
  /**
   * Update only the match status (badge, buttons, scorer state) without full re-render.
   * Follows the same incremental update pattern as updateMatchScore().
   */
  updateMatchStatus(index, match) {
    const matchItem = this._renderRoot.querySelector(
      `.match-item[data-match-index="${index}"]`
    );
    if (!matchItem) {
      return;
    }
    this.updateMatchStatusBadge(matchItem, match);
    this.updateMatchActionButtons(matchItem, match);
    this.updateMatchScorerState(matchItem, match);
  }
  /**
   * Update status badge content and variant for a match item
   */
  updateMatchStatusBadge(matchItem, match) {
    const statusBadge = matchItem.querySelector("mad-badge");
    if (!statusBadge) {
      return;
    }
    const textSpan = statusBadge.querySelector("span.container");
    if (!textSpan) {
      return;
    }
    if (match.status === MatchStatus.PENDING) {
      statusBadge.setAttribute("variant", "brand");
      textSpan.textContent = "Match programmé";
      this.replaceStatusIconWithIcon(statusBadge, "calendar-check");
    } else if (match.status === MatchStatus.DOING) {
      statusBadge.setAttribute("variant", "success");
      textSpan.textContent = "Match en cours";
      this.replaceStatusIconWithSpinner(statusBadge);
    } else if (match.status === MatchStatus.DONE) {
      statusBadge.setAttribute("variant", "warning");
      textSpan.textContent = "Match terminé";
      this.replaceStatusSpinnerWithIcon(statusBadge);
    }
  }
  /**
   * Replace status icon (used for PENDING state) with spinner (for DOING state)
   */
  replaceStatusIconWithIcon(statusBadge, iconName) {
    const existingSpinner = statusBadge.querySelector("mad-spinner");
    if (existingSpinner) {
      const icon = document.createElement("mad-icon");
      icon.classList.add("text-3xl", "text-yellow-600");
      icon.setAttribute("name", iconName);
      existingSpinner.replaceWith(icon);
    } else {
      const existingIcon = statusBadge.querySelector("mad-icon");
      if (existingIcon) {
        existingIcon.setAttribute("name", iconName);
      }
    }
  }
  /**
   * Replace status icon with spinner for active match
   */
  replaceStatusIconWithSpinner(statusBadge) {
    const icon = statusBadge.querySelector("mad-icon");
    if (icon) {
      const spinner = document.createElement("mad-spinner");
      spinner.classList.add("text-2xl");
      icon.replaceWith(spinner);
    }
  }
  /**
   * Replace status spinner with icon for completed match
   */
  replaceStatusSpinnerWithIcon(statusBadge) {
    const spinner = statusBadge.querySelector("mad-spinner");
    if (spinner) {
      const icon = document.createElement("mad-icon");
      icon.classList.add("text-3xl", "text-yellow-600");
      icon.setAttribute("name", "check2-square");
      spinner.replaceWith(icon);
    }
  }
  /**
   * Update action buttons for a match item
   */
  updateMatchActionButtons(matchItem, match) {
    const actionsContainer = matchItem.querySelector(
      ".flex.justify-center.gap-8.py-4"
    );
    if (!actionsContainer) {
      return;
    }
    // Clear existing content and re-render with lit-html
    this._renderActionButtonsInto(actionsContainer, match);
  }
  /**
   * Render action buttons content into a container element
   */
  _renderActionButtonsInto(container, match) {
    // For incremental updates, render the lit-html template into the container
    const template = this._getActionButtonsTemplate(match);
    render(template, container);
    // Re-attach event listeners for new buttons
    const playBtn = container.querySelector(".play-btn");
    const stopBtn = container.querySelector(".stop-btn");
    playBtn?.addEventListener("click", () => {
      const matchId = playBtn.dataset.matchId;
      const tournament = this._tournament.value;
      const m = tournament?.matchs?.find((m) => m.id === Number(matchId));
      if (m) {
        this.playMatch(m);
      }
    });
    stopBtn?.addEventListener("click", () => {
      const matchId = stopBtn.dataset.matchId;
      const tournament = this._tournament.value;
      const m = tournament?.matchs?.find((m) => m.id === Number(matchId));
      if (m) {
        this.stopMatch(m);
      }
    });
  }
  /**
   * Get action buttons template for incremental updates
   */
  _getActionButtonsTemplate(match) {
    const isDoing = match.status === MatchStatus.DOING;
    return html`
      <mad-button
        class="delete-btn w-full"
        data-match-id="${match.id || ""}"
        role="button"
        size="large"
        variant="warning"
      >
        <mad-icon name="trash"></mad-icon>
      </mad-button>

      ${
        isDoing
          ? html`<mad-button class="stop-btn w-full" data-match-id="${match.id || ""}" role="button" size="large" variant="brand">
          <mad-icon name="stop-circle"></mad-icon>
        </mad-button>`
          : html`<mad-button class="play-btn w-full" data-match-id="${match.id || ""}" role="button" size="large" variant="brand">
          <mad-icon name="play-circle"></mad-icon>
        </mad-button>`
      }
    `;
  }
  /**
   * Update scorer readonly state based on match status
   */
  updateMatchScorerState(matchItem, match) {
    const isDoing = match.status === MatchStatus.DOING;
    const scorers = matchItem.querySelectorAll(".host-scorer, .visitor-scorer");
    for (const scorer of Array.from(scorers)) {
      if (isDoing) {
        scorer.removeAttribute("readonly");
      } else {
        scorer.setAttribute("readonly", "");
      }
      if (isDoing) {
        scorer.removeAttribute("hidden");
      } else {
        scorer.setAttribute("hidden", "");
      }
    }
  }
  /**
   * Reset row selection states
   */
  resetRowStates() {
    const rows = this._teamToSelect.value || [];
    for (const row of rows) {
      row.selected = false;
    }
  }
  /**
   * Clean row states (deselect teams not in current match)
   */
  cleanRowStates() {
    const currentMatch = this._currentMatch.value;
    const rows = this._teamToSelect.value || [];
    for (const row of rows) {
      if (
        row.team.id !== currentMatch?.hostId &&
        row.team.id !== currentMatch?.visitorId
      ) {
        row.selected = false;
      }
    }
  }
  /**
   * Handle team selection in team selector
   */
  onTeamSelected(row) {
    row.selected = !row.selected;
    const currentMatch = this._currentMatch.value;
    if (!currentMatch) {
      return;
    }
    if (row.selected) {
      if (currentMatch.hostId) {
        currentMatch.visitorId = row.team.id;
      } else {
        currentMatch.hostId = row.team.id;
      }
      this.cleanRowStates();
    } else if (currentMatch.hostId === row.team.id) {
      currentMatch.hostId = null;
    } else {
      currentMatch.visitorId = null;
    }
    this.refreshUI();
  }
  /**
   * Delete a match
   */
  async deleteMatch(match) {
    const response = await Utils.confirmChoice("Supprimer le match ?");
    const tournament = this._tournament.value;
    if (!(tournament?.matchs && response)) {
      return;
    }
    for (let i = 0, imax = tournament.matchs.length; i < imax; i++) {
      if (!tournament.matchs[i].id || tournament.matchs[i].id === match.id) {
        tournament.matchs.splice(i, 1);
        break;
      }
    }
    this._matchNumber.value = tournament.matchs.length;
    await this.updateTournament();
    this.refreshUI();
  }
  /**
   * Validate team selection and create match
   */
  async goValidateSelection() {
    const tournament = this._tournament.value;
    if (!tournament) {
      return;
    }
    if (!tournament.matchs) {
      tournament.matchs = [];
    }
    const currentMatch = this._currentMatch.value;
    if (currentMatch) {
      tournament.matchs.push(currentMatch);
    }
    this._matchNumber.value = tournament.matchs.length;
    await this.updateTournament();
    this._displayTeamSelector.value = false;
    this._currentMatch.value = null;
  }
  /**
   * Cancel team selection
   */
  cancelSelection() {
    this._displayTeamSelector.value = false;
    this._currentMatch.value = null;
  }
  /**
   * Handle team scores change
   */
  async onTeamScores(match, teamType, detail) {
    const value = Number(detail.value);
    if (teamType === MatchTeamType.VISITOR) {
      match.goals.visitor = value;
    } else {
      match.goals.host = value;
    }
    await this.updateTournament();
    // Incremental update: only update the specific match that changed
    const matchIndex =
      this._tournament.value?.matchs?.findIndex((m) => m.id === match.id) ?? -1;
    if (matchIndex >= 0) {
      this.updateMatchScore(matchIndex, match);
    }
  }
  /**
   * Start a match
   */
  async playMatch(match) {
    match.status = MatchStatus.DOING;
    await this.updateTournament();
    const matchIndex =
      this._tournament.value?.matchs?.findIndex((m) => m.id === match.id) ?? -1;
    if (matchIndex >= 0) {
      this.updateMatchStatus(matchIndex, match);
    }
  }
  /**
   * Stop a match
   */
  async stopMatch(match) {
    match.status = MatchStatus.DONE;
    await this.updateTournament();
    const matchIndex =
      this._tournament.value?.matchs?.findIndex((m) => m.id === match.id) ?? -1;
    if (matchIndex >= 0) {
      this.updateMatchStatus(matchIndex, match);
    }
  }
  /**
   * Auto-scroll to current match
   */
  _autoScrollToMatch(retryCount = 0) {
    const targetIndex = this.targetMatchIndex;
    if (targetIndex === null) {
      return;
    }
    const matchElement = this._renderRoot.querySelector(
      `#match-${targetIndex}`
    );
    if (!matchElement) {
      if (retryCount < 10) {
        requestAnimationFrame(() => this._autoScrollToMatch(retryCount + 1));
      }
      return;
    }
    matchElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  /**
   * Setup scroll navigation
   */
  _setupScrollNavigation() {
    window.addEventListener("scroll", this._handleScroll, { passive: true });
  }
  /**
   * Handle scroll event
   */
  _handleScroll = () => {
    const scrollY = window.scrollY;
    const hasTargetMatch = this.targetMatchIndex !== null;
    const reducedThreshold = window.innerHeight * 0.75;
    const shouldShow = hasTargetMatch
      ? scrollY > 0
      : scrollY > reducedThreshold;
    // Direct DOM manipulation - bypass Signal for performance
    const scrollNav = this._renderRoot.querySelector(".scroll-nav");
    if (scrollNav) {
      scrollNav.classList.toggle("visible", shouldShow);
    }
  };
  /**
   * Setup keyboard shortcuts for navigation
   */
  _setupKeyboardShortcuts() {
    document.addEventListener("keydown", this._handleKeydown);
  }
  /**
   * Scroll to top of page
   */
  _scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  /**
   * Scroll to bottom of page
   */
  _scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }
  /**
   * Scroll to current match
   */
  _scrollToCurrentMatch = () => {
    // Reuse existing autoScrollToMatch logic
    this._autoScrollToMatch();
  };
  /**
   * Render action buttons content (buttons only, no wrapper div)
   */
  renderActionButtonsContent(match) {
    const isDoing = match.status === MatchStatus.DOING;
    return html`
      <mad-button
        class="delete-btn w-full"
        data-match-id="${match.id || ""}"
        role="button"
        size="large"
        variant="warning"
      >
        <mad-icon name="trash"></mad-icon>
      </mad-button>

      ${
        isDoing
          ? html`<mad-button
            class="stop-btn w-full"
            data-match-id="${match.id || ""}"
            role="button"
            size="large"
            variant="brand"
          >
            <mad-icon name="stop-circle"></mad-icon>
          </mad-button>`
          : html`<mad-button
            class="play-btn w-full"
            data-match-id="${match.id || ""}"
            role="button"
            size="large"
            variant="brand"
          >
            <mad-icon name="play-circle"></mad-icon>
          </mad-button>`
      }
    `;
  }
  /**
   * Render action buttons for a match
   */
  renderActionButtons(match) {
    return html`
      <div class="flex justify-center gap-8 py-4">
        ${this.renderActionButtonsContent(match)}
      </div>
    `;
  }
  /**
   * Render match status badge
   */
  renderMatchStatus(match) {
    if (match.status === MatchStatus.PENDING) {
      return html`
        <mad-badge variant="brand">
          <span class="container">Match programmé</span>
          <mad-icon class="text-3xl text-orange-600" name="calendar-check"></mad-icon>
        </mad-badge>
      `;
    }
    if (match.status === MatchStatus.DOING) {
      return html`
        <mad-badge variant="success">
          <span class="container">Match en cours</span>
          <mad-spinner class="text-2xl"></mad-spinner>
        </mad-badge>
      `;
    }
    if (match.status === MatchStatus.DONE) {
      return html`
        <mad-badge variant="warning">
          <span class="container">Match terminé</span>
          <mad-icon class="text-3xl text-yellow-600" name="check2-square"></mad-icon>
        </mad-badge>
      `;
    }
    return html``;
  }
  /**
   * Render scorers based on tournament type
   */
  renderScorers(match) {
    const tournamentType = this._tournament.value?.type;
    const isBasketType =
      tournamentType === TournamentType.NBA ||
      tournamentType === TournamentType.BASKET;
    const isFootType =
      tournamentType === TournamentType.FOOT || !tournamentType;
    const isRugbyType =
      tournamentType === TournamentType.NFL ||
      tournamentType === TournamentType.RUGBY;
    const isDoing = match.status === MatchStatus.DOING;
    const readonlyAttr = isDoing ? "" : "readonly";
    const hiddenAttr = isDoing ? "" : "hidden";
    const minGoal = this.config.minGoal;
    const hostScore = match.goals.host;
    const visitorScore = match.goals.visitor;
    return html`
      <div class="grid grid-cols-11 gap-4">
        ${
          isBasketType
            ? html`<mad-scorer-basket
              min="${minGoal}"
              class="host-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="host"
              ${readonlyAttr}
              value="${hostScore}"
            ></mad-scorer-basket>`
            : nothing
        }

        ${
          isFootType
            ? html`<mad-scorer-common
              min="${minGoal}"
              class="host-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="host"
              ${readonlyAttr}
              ${hiddenAttr}
              value="${hostScore}"
            ></mad-scorer-common>`
            : nothing
        }

        ${
          isRugbyType
            ? html`<mad-scorer-rugby
              min="${minGoal}"
              class="host-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="host"
              ${readonlyAttr}
              value="${hostScore}"
            ></mad-scorer-rugby>`
            : nothing
        }

        <div class="col-span-1"></div>

        ${
          isBasketType
            ? html`<mad-scorer-basket
              min="${minGoal}"
              class="visitor-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="visitor"
              ${readonlyAttr}
              value="${visitorScore}"
            ></mad-scorer-basket>`
            : nothing
        }

        ${
          tournamentType === TournamentType.FOOT
            ? html`<mad-scorer-common
              min="${minGoal}"
              class="visitor-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="visitor"
              ${readonlyAttr}
              ${hiddenAttr}
              value="${visitorScore}"
            ></mad-scorer-common>`
            : nothing
        }

        ${
          isRugbyType
            ? html`<mad-scorer-rugby
              min="${minGoal}"
              class="visitor-scorer col-span-5"
              data-match-id="${match.id || ""}"
              data-team-type="visitor"
              ${readonlyAttr}
              value="${visitorScore}"
            ></mad-scorer-rugby>`
            : nothing
        }
      </div>
    `;
  }
  /**
   * Render a single match item
   */
  renderMatchItem(match, index, rankMap) {
    const hostRank = match.hostId ? rankMap.get(match.hostId) : undefined;
    const visitorRank = match.visitorId
      ? rankMap.get(match.visitorId)
      : undefined;
    return html`
      <div
        id="match-${index}"
        class="match-item rounded border border-sky-300 border-solid px-1 py-4"
        data-match-index="${index}"
      >
        <div>${this.renderMatchStatus(match)}</div>

        <mad-match-tile
          class="match-tile"
          data-match-index="${index}"
          .tournamentId=${this._tournament.value?.id ?? 0}
          .hostId=${match.hostId ?? 0}
          .hostRank=${hostRank ?? 0}
          .hostScore=${match.goals.host}
          .visitorId=${match.visitorId ?? 0}
          .visitorRank=${visitorRank ?? 0}
          .visitorScore=${match.goals.visitor}
        ></mad-match-tile>

        ${this.renderScorers(match)}

        ${this.renderActionButtons(match)}
      </div>
    `;
  }
  /**
   * Render tournament type label
   */
  renderTournamentTypeLabel() {
    const type = this._tournament.value?.type;
    if (type === TournamentType.NBA) {
      return html`${TournamentTypeLabel.NBA}`;
    }
    if (type === TournamentType.NFL) {
      return html`${TournamentTypeLabel.NFL}`;
    }
    if (type === TournamentType.FOOT) {
      return html`${TournamentTypeLabel.FOOT}`;
    }
    if (type === TournamentType.RUGBY) {
      return html`${TournamentTypeLabel.RUGBY}`;
    }
    if (type === TournamentType.BASKET) {
      return html`${TournamentTypeLabel.BASKET}`;
    }
    return html``;
  }
  /**
   * Render match list header
   */
  renderMatchListHeader() {
    return html`
      <div class="bg-orange-600 text-neutral-100 dark:bg-orange-700 dark:text-neutral-50 grid grid-cols-11 items-center py-2">
        <div class="col-span-3">Locaux</div>
        <div class="col-span-5 text-2xl text-center">${this.renderTournamentTypeLabel()}</div>
        <div class="col-span-3">Visiteurs</div>
      </div>
    `;
  }
  /**
   * Render team selector row
   */
  renderTeamSelectorRow(row) {
    return html`
      <tr
        class="team-row cursor-pointer items-center"
        data-team-id="${row.team.id}"
        @click="${() => this._handleTeamRowClick(row)}"
      >
        <td>
          ${
            row.selected
              ? html`<mad-icon class="text-2xl text-green-600" name="check-square"></mad-icon>`
              : html`<mad-icon class="text-2xl text-green-600" name="square"></mad-icon>`
          }
        </td>
        <td>
          <mad-team-tile data-team-row-id="${row.team.id}"></mad-team-tile>
        </td>
        <td>${row.totalMatchs}</td>
        <td>${row.doneMatchs}</td>
        <td>${row.scheduledMatchs}</td>
      </tr>
    `;
  }
  /**
   * Handle team row click
   */
  _handleTeamRowClick(row) {
    const teamToSelect = this._teamToSelect.value || [];
    const selectedRow = teamToSelect.find((r) => r.team.id === row.team.id);
    if (selectedRow) {
      this.onTeamSelected(selectedRow);
    }
  }
  /**
   * Render team selector
   */
  renderTeamSelector() {
    const teamToSelect = this._teamToSelect.value || [];
    const currentMatch = this._currentMatch.value;
    return html`
      <div>
        <h3>Équipes sélectionnées:</h3>
        <mad-match-tile
          .tournamentId=${this._tournament.value?.id ?? 0}
          .hostId=${currentMatch?.hostId ?? 0}
          .visitorId=${currentMatch?.visitorId ?? 0}
        ></mad-match-tile>

        <div class="w-fill overflow-x-auto">
          <table class="table-auto">
            <thead class="bg-orange-600 text-neutral-100 dark:bg-orange-700 dark:text-neutral-50">
              <tr>
                <th>
                  <mad-icon class="text-2xl" name="list-check"></mad-icon>
                </th>
                <th>
                  <span>Équipes</span>
                </th>
                <th>
                  <span>Matchs </span>
                  <span>Total </span>
                </th>
                <th>
                  <span>Matchs </span>
                  <span>Joués </span>
                </th>
                <th>
                  <span>Matchs </span>
                  <span>Programmés </span>
                </th>
              </tr>
            </thead>

            ${repeat(
              teamToSelect,
              (row) => row.team.id,
              (row) => this.renderTeamSelectorRow(row)
            )}
          </table>
        </div>

        <div class="footer">
          <div class="grid-300">
            <mad-button
              class="cancel-btn"
              role="button"
              size="large"
              variant="warning"
              @click="${() => this.cancelSelection()}"
            >
              <mad-icon name="ban" slot="start"></mad-icon>
              <span slot="end">Annuler</span>
            </mad-button>
            <mad-button
              class="validate-btn"
              ?disabled=${currentMatch != null && !(currentMatch.visitorId && currentMatch.hostId)}
              role="button"
              size="large"
              variant="brand"
              @click="${() => this.goValidateSelection()}"
            >
              <span slot="start">Valider</span>
              <mad-icon name="arrow-right" slot="end"></mad-icon>
            </mad-button>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Render NBA generate button
   */
  renderNBAGenerateButton() {
    const tournament = this._tournament.value;
    if (tournament?.type !== TournamentType.NBA) {
      return nothing;
    }
    const missingCount = getNBAMissingMatchCount(tournament);
    if (missingCount === 0) {
      return html`
        <mad-button disabled size="large" variant="success">
          <mad-icon name="check-circle" slot="start"></mad-icon>
          <span slot="end">Season Complete (82 games)</span>
        </mad-button>
      `;
    }
    return html`
      <mad-button
        class="generate-nba-btn"
        role="button"
        size="large"
        variant="success"
        @click="${() => this.goGenerateAllNBAMatches()}"
      >
        <mad-icon name="calendar-plus" slot="start"></mad-icon>
        <span slot="end">Generate All Missing (${missingCount})</span>
      </mad-button>
    `;
  }
  /**
   * Render new match button
   */
  renderNewMatchButton() {
    const isNBAComplete = this.isNBAScheduleComplete;
    return html`
      <div class="footer">
        <div class="grid-300 gap-4">
          <mad-button
            class="new-match-btn"
            ?disabled=${isNBAComplete}
            role="button"
            size="large"
            variant="brand"
            @click="${() => this.goMatch()}"
          >
            <mad-icon name="plus" slot="start"></mad-icon>
            <span slot="end">Nouveau match</span>
          </mad-button>
          <mad-button
            class="auto-match-btn"
            ?disabled=${isNBAComplete}
            role="button"
            size="large"
            variant="success"
            @click="${() => this.goAutoMatch()}"
          >
            <mad-icon name="robot" slot="start"></mad-icon>
            <span slot="end">Auto-Match</span>
          </mad-button>
          ${this.renderNBAGenerateButton()}
        </div>
      </div>
    `;
  }
  /**
   * Main render method
   */
  _render() {
    const tournament = this._tournament.value;
    const uiError = this._uiError.value;
    const displayTeamSelector = this._displayTeamSelector.value;
    const matchNumber = this._matchNumber.value;
    const sortedGrid = Tournaments.sortGrid(tournament?.grid || []);
    const rankMap = new Map();
    for (const [index, team] of sortedGrid.entries()) {
      rankMap.set(team.id, index + 1);
    }
    // Store match elements for auto-scroll
    this.matchRefs.clear();
    this._renderTemplate(html`
      <style>
        :host { display: block; }
        .scroll-nav {
          position: fixed;
          bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          right: 1rem;
          z-index: 50;
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }

        .scroll-nav.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .scroll-nav-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-height: 600px) {
          .scroll-nav {
            bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
          }
        }

        .host-scorer, .visitor-scorer {
          display: flex;
          justify-content: center;
          align-items: center;
          justify-self: center;
        }

        .host-scorer mad-scorer-common,
        .visitor-scorer mad-scorer-common {
          width: 100%;
        }
      </style>
      <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-md">
        <slot name="content"></slot>
      </div>

      ${
        uiError
          ? html`<error-message message="${uiError}"></error-message>`
          : html`
          <div>
            <h1>${tournament?.name || ""}</h1>
            <h2>Match(s)</h2>

            ${
              matchNumber > 0 && !displayTeamSelector
                ? html`
                  <div class="grid grid-cols-1 gap-4">
                    ${this.renderMatchListHeader()}

                    ${
                      tournament?.matchs
                        ? repeat(
                            tournament.matchs,
                            (match) => match.id,
                            (match, index) =>
                              this.renderMatchItem(match, index, rankMap)
                          )
                        : nothing
                    }
                  </div>
                `
                : html`
                  <div>
                    ${
                      displayTeamSelector
                        ? nothing
                        : html`
                          <h2>
                            <span class="text-yellow-600"> Aucun match en cours </span>
                          </h2>
                        `
                    }
                  </div>
                `
            }

            ${
              displayTeamSelector
                ? this.renderTeamSelector()
                : this.renderNewMatchButton()
            }
          </div>
        `
      }

      <div class="scroll-nav" role="navigation" aria-label="Raccourcis de navigation">
        <div class="scroll-nav-buttons">
          <div class="relative group">
            <mad-button
              size="medium"
              variant="default"
              class="w-full nav-btn-top"
              aria-label="Aller en haut de la page"
              @click="${this._scrollToTop}"
            >
              <mad-icon name="chevron-up" aria-hidden="true"></mad-icon>
            </mad-button>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white dark:bg-neutral-600 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller en haut (Alt+T)</div>
          </div>

          <div class="relative group">
            <mad-button
              size="medium"
              variant="brand"
              class="w-full nav-btn-current"
              aria-label="Aller au match en cours ou dernier match joué"
              @click="${this._scrollToCurrentMatch}"
            >
              <mad-icon name="crosshair" aria-hidden="true"></mad-icon>
            </mad-button>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white dark:bg-neutral-600 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller au match actuel (Alt+M)</div>
          </div>

          <div class="relative group">
            <mad-button
              size="medium"
              variant="default"
              class="w-full nav-btn-bottom"
              aria-label="Aller en bas de la page"
              @click="${this._scrollToBottom}"
            >
              <mad-icon name="chevron-down" aria-hidden="true"></mad-icon>
            </mad-button>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white dark:bg-neutral-600 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller en bas (Alt+B)</div>
          </div>
        </div>
      </div>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    `);
    // Populate team tiles with team data (cannot be passed as HTML attributes)
    this._populateTeamTiles();
    // Store match refs after render
    this.updateMatchRefs();
  }
  /**
   * Update match DOM references
   */
  updateMatchRefs() {
    const matchElements = Array.from(
      this._renderRoot.querySelectorAll(".match-item")
    );
    for (const [index, el] of matchElements.entries()) {
      this.matchRefs.set(index, el);
    }
  }
  /**
   * Populate team tiles in the team selector with team data.
   * This must be called after render because team data cannot be passed
   * as HTML attributes (objects are converted to "[object Object]").
   */
  _populateTeamTiles() {
    const teamToSelect = this._teamToSelect.value;
    if (!teamToSelect) {
      return;
    }
    const teamTiles = Array.from(
      this._renderRoot.querySelectorAll("mad-team-tile[data-team-row-id]")
    );
    for (const tile of teamTiles) {
      const teamRowId = Number(tile.dataset.teamRowId);
      const rowData = teamToSelect.find((row) => row.team.id === teamRowId);
      if (rowData?.team?.team && "team" in tile) {
        tile.team = rowData.team.team;
      }
    }
  }
  /**
   * Setup event handlers for elements that can't use @click in templates
   */
  _setupEvents() {
    // Delete buttons - these are rendered dynamically so need event delegation
    const deleteBtns = Array.from(
      this._renderRoot.querySelectorAll(".delete-btn")
    );
    for (const btn of deleteBtns) {
      btn.addEventListener("click", () => {
        const matchId = btn.dataset.matchId;
        if (!matchId) {
          return;
        }
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.deleteMatch(match);
        }
      });
    }
    // Scorer change events - cannot use @madNumberChange in templates
    const hostScorers = Array.from(
      this._renderRoot.querySelectorAll(".host-scorer")
    );
    for (const scorer of hostScorers) {
      scorer.addEventListener("madNumberChange", (ev) => {
        const matchId = scorer.dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.onTeamScores(match, MatchTeamType.HOST, ev.detail);
        }
      });
    }
    const visitorScorers = Array.from(
      this._renderRoot.querySelectorAll(".visitor-scorer")
    );
    for (const scorer of visitorScorers) {
      scorer.addEventListener("madNumberChange", (ev) => {
        const matchId = scorer.dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.onTeamScores(match, MatchTeamType.VISITOR, ev.detail);
        }
      });
    }
  }
  /**
   * Teardown event handlers
   */
  _teardownEvents() {
    // Scroll navigation buttons - removed since they use @click in templates
    const btnTop = this._renderRoot.querySelector(".nav-btn-top");
    const btnCurrent = this._renderRoot.querySelector(".nav-btn-current");
    const btnBottom = this._renderRoot.querySelector(".nav-btn-bottom");
    btnTop?.removeEventListener("click", this._scrollToTop);
    btnCurrent?.removeEventListener("click", this._scrollToCurrentMatch);
    btnBottom?.removeEventListener("click", this._scrollToBottom);
  }
}
// Register the custom element
customElements.define("page-match", PageMatch);
