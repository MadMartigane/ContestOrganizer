<script lang="ts">
  import { onMount, tick } from "svelte";
  import { page } from "$app/stores";
  import ActionBar from "$lib/components/action-bar.svelte";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import ErrorMessage from "$lib/components/error-message.svelte";
  import MatchCreator from "$lib/components/match-creator.svelte";
  import MatchList from "$lib/components/match-list.svelte";
  import NavDock from "$lib/components/nav-dock.svelte";
  import NbaGenerateButton from "$lib/components/nba-generate-button.svelte";
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type {
    Match,
    MatchGoals,
    MatchListScrollApi,
    MatchStatus,
    Tournament,
  } from "$lib/domain/types";
  import {
    match_auto,
    match_count,
    match_empty,
    match_home,
    match_new,
    match_no_teams,
    match_visitor,
    nav_home,
    nav_match,
    nav_tournament,
    nav_tournaments,
    nba_complete,
    tournament_not_found,
  } from "$lib/paraglide/messages";
  import { getTournamentById, updateTournament } from "$lib/services/storage";
  import { autoMatch } from "$lib/utils/match";
  import { isNbaSeasonComplete } from "$lib/utils/nba-schedule";
  import { recalculateGridStats } from "$lib/utils/scoring";

  const tournamentId = $derived(String($page.params.tournamentId));
  let tournament = $state<Tournament | undefined>(undefined);
  let matchListScrollApi = $state<MatchListScrollApi | undefined>(undefined);
  let scrollPercentage = $state(0);
  let showNewMatch = $state(false);

  onMount(() => {
    tournament = getTournamentById(tournamentId);
  });

  function saveTournament(fn: (t: Tournament) => Tournament): void {
    if (!tournament) {
      return;
    }
    const updated = updateTournament(tournament.id, fn);
    if (updated) {
      tournament = recalculateGridStats(updated);
      updateTournament(tournament.id, (_t) => tournament as Tournament);
    }
  }

  const sportConfig = $derived(
    tournament ? SPORT_CONFIG[tournament.type] : undefined
  );
  const matchCount = $derived(tournament ? tournament.matchs.length : 0);
  const hasEnoughTeams = $derived(
    tournament
      ? tournament.grid.filter((s) => s.team !== undefined).length >= 2
      : false
  );

  const isNba = $derived(tournament?.type === "NBA");

  const seasonComplete = $derived(
    tournament ? isNbaSeasonComplete(tournament.grid, tournament.matchs) : false
  );

  async function handleCreateMatch(match: Match): Promise<void> {
    saveTournament((t) => ({
      ...t,
      matchs: [...t.matchs, match],
    }));
    showNewMatch = false;
    await tick();
    requestAnimationFrame(() => {
      matchListScrollApi?.scrollToBottom();
    });
  }

  async function handleAutoMatch(): Promise<void> {
    if (!tournament) {
      return;
    }
    const match = autoMatch(tournament.grid, tournament.matchs);
    if (match) {
      saveTournament((t) => ({
        ...t,
        matchs: [...t.matchs, match],
      }));
      await tick();
      requestAnimationFrame(() => {
        matchListScrollApi?.scrollToBottom();
      });
    }
  }

  async function handleNbaGenerate(newMatches: Match[]): Promise<void> {
    if (!tournament) {
      return;
    }
    saveTournament((t) => ({
      ...t,
      matchs: [...t.matchs, ...newMatches],
    }));
    await tick();
    requestAnimationFrame(() => {
      matchListScrollApi?.scrollToBottom();
    });
  }

  function handleStatusChange(matchId: string, status: MatchStatus): void {
    saveTournament((t) => ({
      ...t,
      matchs: t.matchs.map((m) => (m.id === matchId ? { ...m, status } : m)),
    }));
  }

  function handleDelete(matchId: string): void {
    saveTournament((t) => ({
      ...t,
      matchs: t.matchs.filter((m) => m.id !== matchId),
    }));
  }

  function handleGoalsChange(matchId: string, goals: MatchGoals): void {
    saveTournament((t) => ({
      ...t,
      matchs: t.matchs.map((m) => (m.id === matchId ? { ...m, goals } : m)),
    }));
  }

  const targetMatchIndex = $derived.by(() => {
    if (!tournament) {
      return -1;
    }
    const doingIndex = tournament.matchs.findLastIndex(
      (m) => m.status === "DOING"
    );
    if (doingIndex !== -1) {
      return doingIndex;
    }
    let doneIndex = -1;
    for (let i = tournament.matchs.length - 1; i >= 0; i--) {
      if (tournament.matchs[i].status === "DONE") {
        doneIndex = i;
        break;
      }
    }
    return doneIndex;
  });

  const hasTargetMatch = $derived(targetMatchIndex >= 0);

  const showDock = $derived(scrollPercentage > 2);

  function handleScrollChange(percentage: number): void {
    scrollPercentage = percentage;
  }

  function handleScrollToTop(): void {
    matchListScrollApi?.scrollToTop();
  }

  function handleScrollToCurrentMatch(): void {
    if (targetMatchIndex >= 0) {
      matchListScrollApi?.scrollToIndex(targetMatchIndex);
    }
  }

  function handleScrollToBottom(): void {
    matchListScrollApi?.scrollToBottom();
  }
</script>

<svelte:head>
  <title>{tournament ? tournament.name : nav_match()}</title>
</svelte:head>

{#if tournament}
  <Breadcrumb
    items={[
      { emoji: "🏠", label: nav_home(), href: "/home" },
      { emoji: "🏆", label: nav_tournaments(), href: "/tournaments" },
      {
        emoji: "📋",
        label: tournament.name,
        href: `/tournament/${tournamentId}`,
      },
      { emoji: "🎮", label: nav_match() },
    ]}
  />

  <div class="flex flex-col items-center gap-6 mt-6">
    <div class="flex items-center justify-center gap-2">
      <h1 class="text-2xl font-bold">{match_count({ count: matchCount })}</h1>
      {#if isNba && seasonComplete}
        <span
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-success-500/20 text-success-600 dark:text-success-400"
        >
          🏆 {nba_complete()}
        </span>
      {/if}
    </div>

    <div class="w-full max-w-md">
      <ActionBar>
        <button
          type="button"
          class="btn btn-lg preset-filled"
          disabled={!hasEnoughTeams || seasonComplete}
          onclick={() => (showNewMatch = true)}
        >
          ➕ {match_new()}
        </button>
        <button
          type="button"
          class="btn btn-lg preset-tonal"
          disabled={!hasEnoughTeams || seasonComplete}
          onclick={handleAutoMatch}
        >
          🔄 {match_auto()}
        </button>
        {#if isNba}
          <NbaGenerateButton
            grid={tournament.grid}
            matchs={tournament.matchs}
            onGenerate={handleNbaGenerate}
            {seasonComplete}
            sportType={tournament.type}
          />
        {/if}
      </ActionBar>
    </div>

    <div class="w-full">
      {#if !hasEnoughTeams}
        <p class="text-center text-surface-500 py-4">{match_no_teams()}</p>
      {:else if matchCount === 0}
        <p class="text-center text-warning-600 dark:text-warning-400 py-4">
          {match_empty()}
        </p>
      {:else}
        <!-- Match list header: 3-column grid aligned with MatchTile layout -->
        <div
          class="grid grid-cols-[3fr_5fr_3fr] text-center text-sm font-semibold text-surface-500 py-2"
        >
          <div class="col-span-1">{match_home()}</div>
          <div class="col-span-1">
            {sportConfig?.emoji ?? ''} {sportConfig?.label ?? ''}
          </div>
          <div class="col-span-1">{match_visitor()}</div>
        </div>

        <MatchList
          {tournament}
          bind:scrollApi={matchListScrollApi}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onGoalsChange={handleGoalsChange}
          onScrollChange={handleScrollChange}
        />
      {/if}
    </div>

    {#if showNewMatch}
      <div class="w-full">
        <MatchCreator
          grid={tournament.grid}
          matches={tournament.matchs}
          onCreateMatch={handleCreateMatch}
          onCancel={() => (showNewMatch = false)}
          sportType={tournament.type}
        />
      </div>
    {/if}

    <NavDock
      {hasTargetMatch}
      onScrollToTop={handleScrollToTop}
      onScrollToCurrentMatch={handleScrollToCurrentMatch}
      onScrollToBottom={handleScrollToBottom}
      visible={showDock}
    />
  </div>
{:else}
  <ErrorMessage
    description={tournament_not_found({ id: tournamentId })}
    showHomeButton={true}
  />
{/if}
