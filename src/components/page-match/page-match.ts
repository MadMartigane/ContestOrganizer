import { BaseElement } from "@core/base-element.js";
import { Signal } from "@core/signal.js";
import { getTournaments } from "../../modules/init.js";
import Matchs, {
  Match,
  MatchStatus,
  MatchTeamType,
  type Row,
} from "../../modules/matchs/matchs.js";
import {
  generateNBAScheduleMinimax,
  getNBAMissingMatchCount,
  validateNBAScheduleGeneration,
} from "../../modules/nba/nba.scheduler.js";
import type { GenericTeam } from "../../modules/team-row/team-row.d.js";
import { Tournaments } from "../../modules/tournaments/tournaments.js";
import type { Tournament } from "../../modules/tournaments/tournaments.types.js";
import {
  TournamentType,
  TournamentTypeLabel,
} from "../../modules/tournaments/tournaments.types.js";
import Utils from "../../modules/utils/utils.js";

import { calculateTargetMatchIndex } from "./page-match.logic.js";

interface Config {
  minGoal: number;
}

/**
 * PageMatch - Tournament match management page component
 * @element page-match
 */
export class PageMatch extends BaseElement {
  private readonly config: Config = {
    minGoal: 0,
  };

  // Property: tournament-id attribute
  private _tournamentId = 0;

  // State signals (initialized in _setupProperties)
  private declare _tournament: Signal<Tournament | null>;
  private declare _uiError: Signal<string | null>;
  private declare _displayTeamSelector: Signal<boolean>;
  private declare _teamToSelect: Signal<Row[] | null>;
  private declare _matchNumber: Signal<number>;
  private declare _currentMatch: Signal<Match | null>;

  private declare _matchRefs: Signal<HTMLElement[]>;

  // DOM references
  private readonly matchRefs: Map<number, HTMLElement> = new Map();

  // Keyboard handler
  private readonly _handleKeydown = (e: KeyboardEvent): void => {
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
          break;
      }
    }
  };

  /**
   * Observed attributes for reactive updates
   */
  static get observedAttributes(): string[] {
    return ["tournament-id"];
  }

  /**
   * Tournament ID property
   */
  get tournamentId(): number {
    return this._tournamentId;
  }

  set tournamentId(value: number) {
    this.setAttribute("tournament-id", String(value));
  }

  /**
   * Gets the target match index for auto-scrolling
   */
  private get targetMatchIndex(): number | null {
    return calculateTargetMatchIndex(this._tournament.value);
  }

  /**
   * Checks if NBA schedule is complete
   */
  private get isNBAScheduleComplete(): boolean {
    const tournament = this._tournament.value;
    if (!tournament || tournament.type !== TournamentType.NBA) {
      return false;
    }
    return getNBAMissingMatchCount(tournament) === 0;
  }

  /**
   * Sets up component properties from attributes and initializes signals
   */
  protected _setupProperties(): void {
    // Initialize signals
    this._tournament = new Signal<Tournament | null>(null);
    this._uiError = new Signal<string | null>(null);
    this._displayTeamSelector = new Signal<boolean>(false);
    this._teamToSelect = new Signal<Row[] | null>(null);
    this._matchNumber = new Signal<number>(0);
    this._currentMatch = new Signal<Match | null>(null);
    this._matchRefs = new Signal<HTMLElement[]>([]);

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
  connectedCallback(): void {
    super.connectedCallback();
    this.initTournaments();
    this._setupScrollNavigation();
  }

  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback(): void {
    document.removeEventListener("keydown", this._handleKeydown);
    window.removeEventListener("scroll", this._handleScroll);
    super.disconnectedCallback();
  }

  /**
   * Use Light DOM for Shoelace compatibility
   */
  protected _createRenderRoot(): Element {
    return this;
  }

  /**
   * Handles attribute changes
   */
  protected _onAttributeChange(name: string, value: string | null): void {
    if (name === "tournament-id") {
      this._tournamentId = value ? Number(value) : 0;
      this.initTournaments();
    }
  }

  /**
   * Initialize tournaments
   */
  private async initTournaments(): Promise<number> {
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
  private updateTournament(): Promise<number> {
    const tournament = this._tournament.value;
    if (!tournament) {
      return Promise.resolve(0);
    }

    return getTournaments().update(tournament);
  }

  /**
   * Open match creation dialog
   */
  private goMatch(): void {
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
  private async goAutoMatch(): Promise<void> {
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
  private async goGenerateAllNBAMatches(): Promise<void> {
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
  private refreshUI(): void {
    this._requestRender();
  }

  /**
   * Update only the score display for a specific match without full re-render
   */
  private updateMatchScore(index: number, match: Match): void {
    const matchTile = this.querySelector(
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
  private updateMatchStatus(index: number, match: Match): void {
    const matchItem = this.querySelector(
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
  private updateMatchStatusBadge(matchItem: Element, match: Match): void {
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
  private replaceStatusIconWithIcon(
    statusBadge: Element,
    iconName: string
  ): void {
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
  private replaceStatusIconWithSpinner(statusBadge: Element): void {
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
  private replaceStatusSpinnerWithIcon(statusBadge: Element): void {
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
  private updateMatchActionButtons(matchItem: Element, match: Match): void {
    const actionsContainer = matchItem.querySelector(
      ".flex.justify-center.gap-8.py-4"
    );
    if (!actionsContainer) {
      return;
    }

    actionsContainer.innerHTML = this.renderActionButtonsContent(match);

    // Re-attach event listeners for new buttons
    const playBtn = actionsContainer.querySelector(".play-btn");
    const stopBtn = actionsContainer.querySelector(".stop-btn");

    playBtn?.addEventListener("click", () => {
      const matchId = (playBtn as HTMLElement).dataset.matchId;
      const tournament = this._tournament.value;
      const m = tournament?.matchs?.find((m) => m.id === Number(matchId));
      if (m) {
        this.playMatch(m);
      }
    });

    stopBtn?.addEventListener("click", () => {
      const matchId = (stopBtn as HTMLElement).dataset.matchId;
      const tournament = this._tournament.value;
      const m = tournament?.matchs?.find((m) => m.id === Number(matchId));
      if (m) {
        this.stopMatch(m);
      }
    });
  }

  /**
   * Update scorer readonly state based on match status
   */
  private updateMatchScorerState(matchItem: Element, match: Match): void {
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
  private resetRowStates(): void {
    const rows = this._teamToSelect.value || [];
    for (const row of rows) {
      row.selected = false;
    }
  }

  /**
   * Clean row states (deselect teams not in current match)
   */
  private cleanRowStates(): void {
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
  private onTeamSelected(row: Row): void {
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
  private async deleteMatch(match: Match): Promise<void> {
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
  private async goValidateSelection(): Promise<void> {
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
  private cancelSelection(): void {
    this._displayTeamSelector.value = false;
    this._currentMatch.value = null;
  }

  /**
   * Handle team scores change
   */
  private async onTeamScores(
    match: Match,
    teamType: MatchTeamType,
    detail: { value: string }
  ): Promise<void> {
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
  private async playMatch(match: Match): Promise<void> {
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
  private async stopMatch(match: Match): Promise<void> {
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
  private _autoScrollToMatch(retryCount = 0): void {
    const targetIndex = this.targetMatchIndex;
    if (targetIndex === null) {
      return;
    }

    const matchElement = this.querySelector(`#match-${targetIndex}`);
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
  private _setupScrollNavigation(): void {
    window.addEventListener("scroll", this._handleScroll, { passive: true });
  }

  /**
   * Handle scroll event
   */
  private readonly _handleScroll = (): void => {
    const scrollY = window.scrollY;
    const hasTargetMatch = this.targetMatchIndex !== null;
    const reducedThreshold = window.innerHeight * 0.75;
    const shouldShow = hasTargetMatch
      ? scrollY > 0
      : scrollY > reducedThreshold;

    // Direct DOM manipulation - bypass Signal for performance
    const scrollNav = this.querySelector(".scroll-nav");
    if (scrollNav) {
      scrollNav.classList.toggle("visible", shouldShow);
    }
  };

  /**
   * Setup keyboard shortcuts for navigation
   */
  private _setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", this._handleKeydown);
  }

  /**
   * Scroll to top of page
   */
  private _scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Scroll to bottom of page
   */
  private _scrollToBottom(): void {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  /**
   * Scroll to current match
   */
  private readonly _scrollToCurrentMatch = (): void => {
    // Reuse existing autoScrollToMatch logic
    this._autoScrollToMatch();
  };

  /**
   * Render action buttons content (buttons only, no wrapper div)
   */
  private renderActionButtonsContent(match: Match): string {
    const isDoing = match.status === MatchStatus.DOING;
    return `
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
          ? `<mad-button class="stop-btn w-full" data-match-id="${
              match.id || ""
            }" role="button" size="large" variant="brand">
          <mad-icon name="stop-circle"></mad-icon>
        </mad-button>`
          : `<mad-button class="play-btn w-full" data-match-id="${
              match.id || ""
            }" role="button" size="large" variant="brand">
          <mad-icon name="play-circle"></mad-icon>
        </mad-button>`
      }
    `;
  }

  /**
   * Render action buttons for a match
   */
  private renderActionButtons(match: Match): string {
    return `
      <div class="flex justify-center gap-8 py-4">
        ${this.renderActionButtonsContent(match)}
      </div>
    `;
  }

  /**
   * Render match status badge
   */
  private renderMatchStatus(match: Match): string {
    if (match.status === MatchStatus.PENDING) {
      return `
        <mad-badge variant="brand">
          <span class="container">Match programmé</span>
          <mad-icon class="text-3xl text-orange-600" name="calendar-check"></mad-icon>
        </mad-badge>
      `;
    }

    if (match.status === MatchStatus.DOING) {
      return `
        <mad-badge variant="success">
          <span class="container">Match en cours</span>
          <mad-spinner class="text-2xl"></mad-spinner>
        </mad-badge>
      `;
    }

    if (match.status === MatchStatus.DONE) {
      return `
        <mad-badge variant="warning">
          <span class="container">Match terminé</span>
          <mad-icon class="text-3xl text-yellow-600" name="check2-square"></mad-icon>
        </mad-badge>
      `;
    }

    return "";
  }

  /**
   * Render scorers based on tournament type
   */
  private renderScorers(match: Match): string {
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

    return `
      <div class="grid grid-cols-11 gap-4">
        ${
          isBasketType
            ? `<mad-scorer-basket
            min="${minGoal}"
            class="host-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="host"
            ${readonlyAttr}
            value="${hostScore}"
          ></mad-scorer-basket>`
            : ""
        }

        ${
          isFootType
            ? `<mad-scorer-common
            min="${minGoal}"
            class="host-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="host"
            ${readonlyAttr}
            ${hiddenAttr}
            value="${hostScore}"
          ></mad-scorer-common>`
            : ""
        }

        ${
          isRugbyType
            ? `<mad-scorer-rugby
            min="${minGoal}"
            class="host-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="host"
            ${readonlyAttr}
            value="${hostScore}"
          ></mad-scorer-rugby>`
            : ""
        }

        <div class="col-span-1"></div>

        ${
          isBasketType
            ? `<mad-scorer-basket
            min="${minGoal}"
            class="visitor-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="visitor"
            ${readonlyAttr}
            value="${visitorScore}"
          ></mad-scorer-basket>`
            : ""
        }

        ${
          tournamentType === TournamentType.FOOT
            ? `<mad-scorer-common
            min="${minGoal}"
            class="visitor-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="visitor"
            ${readonlyAttr}
            ${hiddenAttr}
            value="${visitorScore}"
          ></mad-scorer-common>`
            : ""
        }

        ${
          isRugbyType
            ? `<mad-scorer-rugby
            min="${minGoal}"
            class="visitor-scorer col-span-5"
            data-match-id="${match.id || ""}"
            data-team-type="visitor"
            ${readonlyAttr}
            value="${visitorScore}"
          ></mad-scorer-rugby>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Render a single match item
   */
  private renderMatchItem(
    match: Match,
    index: number,
    rankMap: Map<number, number>
  ): string {
    const hostRank = match.hostId ? rankMap.get(match.hostId) : undefined;
    const visitorRank = match.visitorId
      ? rankMap.get(match.visitorId)
      : undefined;

    return `
      <div id="match-${index}" class="match-item rounded border border-sky-300 border-solid px-1 py-4" data-match-index="${index}">
        <div>${this.renderMatchStatus(match)}</div>

        <mad-match-tile
          class="match-tile"
          data-match-index="${index}"
          tournament-id="${this._tournament.value?.id || ""}"
          host-id="${match.hostId || ""}"
          host-rank="${hostRank || ""}"
          host-score="${match.goals.host}"
          visitor-id="${match.visitorId || ""}"
          visitor-rank="${visitorRank || ""}"
          visitor-score="${match.goals.visitor}"
        ></mad-match-tile>

        ${this.renderScorers(match)}

        ${this.renderActionButtons(match)}
      </div>
    `;
  }

  /**
   * Render tournament type label
   */
  private renderTournamentTypeLabel(): string {
    const type = this._tournament.value?.type;

    if (type === TournamentType.NBA) {
      return TournamentTypeLabel.NBA;
    }
    if (type === TournamentType.NFL) {
      return TournamentTypeLabel.NFL;
    }
    if (type === TournamentType.FOOT) {
      return TournamentTypeLabel.FOOT;
    }
    if (type === TournamentType.RUGBY) {
      return TournamentTypeLabel.RUGBY;
    }
    if (type === TournamentType.BASKET) {
      return TournamentTypeLabel.BASKET;
    }

    return "";
  }

  /**
   * Render match list header
   */
  private renderMatchListHeader(): string {
    return `
      <div class="bg-orange-600 text-neutral-100 grid grid-cols-11 items-center py-2">
        <div class="col-span-3">Locaux</div>
        <div class="col-span-5 text-2xl text-center">${this.renderTournamentTypeLabel()}</div>
        <div class="col-span-3">Visiteurs</div>
      </div>
    `;
  }

  /**
   * Render team selector row
   */
  private renderTeamSelectorRow(row: Row): string {
    return `
      <tr
        class="team-row cursor-pointer items-center"
        data-team-id="${row.team.id}"
      >
        <td>
          ${
            row.selected
              ? `<mad-icon class="text-2xl text-green-600" name="check-square"></mad-icon>`
              : `<mad-icon class="text-2xl text-green-600" name="square"></mad-icon>`
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
   * Render team selector
   */
  private renderTeamSelector(): string {
    const teamToSelect = this._teamToSelect.value || [];
    const currentMatch = this._currentMatch.value;

    return `
      <div>
        <h3>Équipes sélectionnées:</h3>
        <mad-match-tile
          tournament-id="${this._tournament.value?.id || ""}"
          host-id="${currentMatch?.hostId || ""}"
          visitor-id="${currentMatch?.visitorId || ""}"
        ></mad-match-tile>

        <div class="w-fill overflow-x-auto">
          <table class="table-auto">
            <thead class="bg-orange-600 text-neutral-100">
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

            ${teamToSelect.map((row) => this.renderTeamSelectorRow(row)).join("")}
          </table>
        </div>

        <div class="footer">
          <div class="grid-300">
            <mad-button
              class="cancel-btn"
              role="button"
              size="large"
              variant="warning"
            >
              <mad-icon name="ban" slot="start"></mad-icon>
              <span slot="end">Annuler</span>
            </mad-button>
            <mad-button
              class="validate-btn"
              ${
                currentMatch && !(currentMatch.visitorId && currentMatch.hostId)
                  ? "disabled"
                  : ""
              }
              role="button"
              size="large"
              variant="brand"
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
  private renderNBAGenerateButton(): string {
    const tournament = this._tournament.value;
    if (tournament?.type !== TournamentType.NBA) {
      return "";
    }

    const missingCount = getNBAMissingMatchCount(tournament);
    if (missingCount === 0) {
      return `
        <mad-button disabled size="large" variant="success">
          <mad-icon name="check-circle" slot="start"></mad-icon>
          <span slot="end">Season Complete (82 games)</span>
        </mad-button>
      `;
    }

    return `
      <mad-button
        class="generate-nba-btn"
        role="button"
        size="large"
        variant="success"
      >
        <mad-icon name="calendar-plus" slot="start"></mad-icon>
        <span slot="end">Generate All Missing (${missingCount})</span>
      </mad-button>
    `;
  }

  /**
   * Render new match button
   */
  private renderNewMatchButton(): string {
    const isNBAComplete = this.isNBAScheduleComplete;

    return `
      <div class="footer">
        <div class="grid-300 gap-4">
          <mad-button
            class="new-match-btn"
            ${isNBAComplete ? "disabled" : ""}
            role="button"
            size="large"
            variant="brand"
          >
            <mad-icon name="plus" slot="start"></mad-icon>
            <span slot="end">Nouveau match</span>
          </mad-button>
          <mad-button
            class="auto-match-btn"
            ${isNBAComplete ? "disabled" : ""}
            role="button"
            size="large"
            variant="success"
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
   * Render scroll navigation dock
   */
  private _renderScrollNavigation(): string {
    const hasTargetMatch =
      calculateTargetMatchIndex(this._tournament.value) !== null;
    // Visibility is controlled by scroll handler via direct DOM manipulation
    // Initial state is hidden (no 'visible' class)

    return `
    <div class="scroll-nav"
         role="navigation"
         aria-label="Raccourcis de navigation">
      <div class="scroll-nav-buttons">
        <div class="relative group">
          <mad-button size="medium"
                     variant="default"
                     class="w-full nav-btn-top"
                     aria-label="Aller en haut de la page">
            <mad-icon name="chevron-up" aria-hidden="true"></mad-icon>
          </mad-button>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller en haut (Alt+T)</div>
        </div>

        <div class="relative group">
          <mad-button size="medium"
                     variant="brand"
                     class="w-full nav-btn-current"
                     ${hasTargetMatch ? "" : "disabled"}
                     aria-label="Aller au match en cours ou dernier match joué">
            <mad-icon name="crosshair" aria-hidden="true"></mad-icon>
          </mad-button>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller au match actuel (Alt+M)</div>
        </div>

        <div class="relative group">
          <mad-button size="medium"
                     variant="default"
                     class="w-full nav-btn-bottom"
                     aria-label="Aller en bas de la page">
            <mad-icon name="chevron-down" aria-hidden="true"></mad-icon>
          </mad-button>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Aller en bas (Alt+B)</div>
        </div>
      </div>
    </div>
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
  `;
  }

  /**
   * Main render method
   */
  protected _render(): void {
    const tournament = this._tournament.value;
    const uiError = this._uiError.value;
    const displayTeamSelector = this._displayTeamSelector.value;
    const matchNumber = this._matchNumber.value;

    const sortedGrid = Tournaments.sortGrid(tournament?.grid || []);
    const rankMap = new Map<number, number>();
    for (const [index, team] of sortedGrid.entries()) {
      rankMap.set(team.id, index + 1);
    }

    // Store match elements for auto-scroll
    this.matchRefs.clear();

    this.innerHTML = `
      <style>
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

      <div class="max-w-[1280px] px-4 mx-auto my-12 text-center bg-neutral-100 rounded-lg shadow-md">
        ${
          uiError
            ? `<error-message message="${uiError}"></error-message>`
            : `
          <div>
            <h1>${tournament?.name || ""}</h1>
            <h2>Match(s)</h2>

            ${
              matchNumber > 0 && !displayTeamSelector
                ? `
                <div class="grid grid-cols-1 gap-4">
                  ${this.renderMatchListHeader()}

                  ${
                    tournament?.matchs
                      ? tournament.matchs
                          .map((match, index) =>
                            this.renderMatchItem(match, index, rankMap)
                          )
                          .join("")
                      : ""
                  }
                </div>
              `
                : `
                <div>
                  ${
                    displayTeamSelector
                      ? ""
                      : `
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
      </div>

      ${this._renderScrollNavigation()}
    `;

    // Setup event handlers after render
    this._setupEvents();

    // Populate team tiles with team data (cannot be passed as HTML attributes)
    this._populateTeamTiles();

    // Store match refs after render
    this.updateMatchRefs();
  }

  /**
   * Update match DOM references
   */
  private updateMatchRefs(): void {
    const matchElements = Array.from(this.querySelectorAll(".match-item"));
    for (const [index, el] of matchElements.entries()) {
      this.matchRefs.set(index, el as HTMLElement);
    }
  }

  /**
   * Populate team tiles in the team selector with team data.
   * This must be called after render because team data cannot be passed
   * as HTML attributes (objects are converted to "[object Object]").
   */
  private _populateTeamTiles(): void {
    const teamToSelect = this._teamToSelect.value;
    if (!teamToSelect) {
      return;
    }

    const teamTiles = Array.from(
      this.querySelectorAll("mad-team-tile[data-team-row-id]")
    );
    for (const tile of teamTiles) {
      const teamRowId = Number((tile as HTMLElement).dataset.teamRowId);
      const rowData = teamToSelect.find((row) => row.team.id === teamRowId);

      if (rowData?.team?.team && "team" in tile) {
        (tile as HTMLElement & { team: GenericTeam }).team = rowData.team.team;
      }
    }
  }

  /**
   * Setup event handlers
   */
  protected _setupEvents(): void {
    // New match button
    const newMatchBtn = this.querySelector(".new-match-btn");
    newMatchBtn?.addEventListener("click", () => {
      this.goMatch();
    });

    // Auto match button
    const autoMatchBtn = this.querySelector(".auto-match-btn");
    autoMatchBtn?.addEventListener("click", () => {
      this.goAutoMatch();
    });

    // Generate NBA button
    const generateNBABtn = this.querySelector(".generate-nba-btn");
    generateNBABtn?.addEventListener("click", () => {
      this.goGenerateAllNBAMatches();
    });

    // Cancel button
    const cancelBtn = this.querySelector(".cancel-btn");
    cancelBtn?.addEventListener("click", () => {
      this.cancelSelection();
    });

    // Validate button
    const validateBtn = this.querySelector(".validate-btn");
    validateBtn?.addEventListener("click", () => {
      this.goValidateSelection();
    });

    // Team selector rows
    const teamRows = Array.from(this.querySelectorAll(".team-row"));
    for (const row of teamRows) {
      row.addEventListener("click", () => {
        const teamId = (row as HTMLElement).dataset.teamId;
        const teamToSelect = this._teamToSelect.value || [];
        const selectedRow = teamToSelect.find(
          (r) => r.team.id === Number(teamId)
        );
        if (selectedRow) {
          this.onTeamSelected(selectedRow);
        }
      });
    }

    // Delete buttons
    const deleteBtns = Array.from(this.querySelectorAll(".delete-btn"));
    for (const btn of deleteBtns) {
      btn.addEventListener("click", () => {
        const matchId = (btn as HTMLElement).dataset.matchId;
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

    // Play buttons
    const playBtns = Array.from(this.querySelectorAll(".play-btn"));
    for (const btn of playBtns) {
      btn.addEventListener("click", () => {
        const matchId = (btn as HTMLElement).dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.playMatch(match);
        }
      });
    }

    // Stop buttons
    const stopBtns = Array.from(this.querySelectorAll(".stop-btn"));
    for (const btn of stopBtns) {
      btn.addEventListener("click", () => {
        const matchId = (btn as HTMLElement).dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.stopMatch(match);
        }
      });
    }

    // Scorer change events
    const hostScorers = Array.from(this.querySelectorAll(".host-scorer"));
    for (const scorer of hostScorers) {
      scorer.addEventListener("madNumberChange", (ev: Event) => {
        const matchId = (scorer as HTMLElement).dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.onTeamScores(
            match,
            MatchTeamType.HOST,
            (ev as CustomEvent).detail
          );
        }
      });
    }

    const visitorScorers = Array.from(this.querySelectorAll(".visitor-scorer"));
    for (const scorer of visitorScorers) {
      scorer.addEventListener("madNumberChange", (ev: Event) => {
        const matchId = (scorer as HTMLElement).dataset.matchId;
        const tournament = this._tournament.value;
        const match = tournament?.matchs?.find((m) => m.id === Number(matchId));
        if (match) {
          this.onTeamScores(
            match,
            MatchTeamType.VISITOR,
            (ev as CustomEvent).detail
          );
        }
      });
    }

    // Scroll navigation buttons
    const btnTop = this.querySelector(".nav-btn-top");
    const btnCurrent = this.querySelector(".nav-btn-current");
    const btnBottom = this.querySelector(".nav-btn-bottom");

    btnTop?.addEventListener("click", this._scrollToTop);
    btnCurrent?.addEventListener("click", this._scrollToCurrentMatch);
    btnBottom?.addEventListener("click", this._scrollToBottom);
  }

  /**
   * Teardown event handlers
   */
  protected _teardownEvents(): void {
    // Scroll navigation buttons
    const btnTop = this.querySelector(".nav-btn-top");
    const btnCurrent = this.querySelector(".nav-btn-current");
    const btnBottom = this.querySelector(".nav-btn-bottom");

    btnTop?.removeEventListener("click", this._scrollToTop);
    btnCurrent?.removeEventListener("click", this._scrollToCurrentMatch);
    btnBottom?.removeEventListener("click", this._scrollToBottom);
  }
}

// Register the custom element
customElements.define("page-match", PageMatch);
