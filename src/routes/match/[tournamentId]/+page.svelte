<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import ActionBar from "$lib/components/action-bar.svelte";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import ErrorMessage from "$lib/components/error-message.svelte";
  import MatchCreator from "$lib/components/match-creator.svelte";
  import MatchList from "$lib/components/match-list.svelte";
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type {
    Match,
    MatchGoals,
    MatchStatus,
    Tournament,
  } from "$lib/domain/types";
  import {
    match_auto,
    match_count,
    match_empty,
    match_new,
    match_no_teams,
    nav_home,
    nav_match,
    nav_tournament,
    nav_tournaments,
    tournament_not_found,
  } from "$lib/paraglide/messages";
  import { getTournamentById, updateTournament } from "$lib/services/storage";
  import { autoMatch } from "$lib/utils/match";
  import { recalculateGridStats } from "$lib/utils/scoring";

  const tournamentId = $derived(String($page.params.tournamentId));
  let tournament = $state<Tournament | undefined>(undefined);
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

  function handleCreateMatch(match: Match): void {
    saveTournament((t) => ({
      ...t,
      matchs: [...t.matchs, match],
    }));
    showNewMatch = false;
  }

  function handleAutoMatch(): void {
    if (!tournament) {
      return;
    }
    const match = autoMatch(tournament.grid, tournament.matchs);
    if (match) {
      saveTournament((t) => ({
        ...t,
        matchs: [...t.matchs, match],
      }));
    }
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
</script>

<svelte:head>
  <title>{tournament ? tournament.name : nav_match()}</title>
</svelte:head>

{#if tournament}
  <div class="flex flex-col gap-4">
    <Breadcrumb
      items={[
        { emoji: "🏠", label: nav_home(), href: "/home" },
        { emoji: "🏆", label: nav_tournaments(), href: "/tournaments" },
        {
          emoji: "📋",
          label: tournament.name,
          href: "/tournament/{tournamentId}",
        },
        { emoji: "🎮", label: nav_match() },
      ]}
    />

    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{match_count({ count: matchCount })}</h1>
    </div>

    <ActionBar>
      <button
        type="button"
        class="btn preset-filled"
        disabled={!hasEnoughTeams}
        onclick={() => (showNewMatch = true)}
      >
        ➕ {match_new()}
      </button>
      <button
        type="button"
        class="btn preset-tonal"
        disabled={!hasEnoughTeams}
        onclick={handleAutoMatch}
      >
        🔄 {match_auto()}
      </button>
    </ActionBar>

    {#if !hasEnoughTeams}
      <p class="text-center text-surface-500 py-4">{match_no_teams()}</p>
    {:else if matchCount === 0}
      <p class="text-center text-surface-500 py-4">{match_empty()}</p>
    {:else}
      <MatchList
        {tournament}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onGoalsChange={handleGoalsChange}
      />
    {/if}

    {#if showNewMatch}
      <MatchCreator
        grid={tournament.grid}
        onCreateMatch={handleCreateMatch}
        onCancel={() => (showNewMatch = false)}
      />
    {/if}
  </div>
{:else}
  <ErrorMessage
    description={tournament_not_found({ id: tournamentId })}
    showHomeButton={true}
  />
{/if}
