<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import ActionBar from "$lib/components/action-bar.svelte";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import ConfirmDialog from "$lib/components/confirm-dialog.svelte";
  import ErrorMessage from "$lib/components/error-message.svelte";
  import GridTable from "$lib/components/grid-table.svelte";
  import NbaMagicFillupButton from "$lib/components/nba-magic-fillup-button.svelte";
  import NumericField from "$lib/components/numeric-field.svelte";
  import TeamSearchDrawer from "$lib/components/team-search-drawer.svelte";
  import TournamentHeader from "$lib/components/tournament-header.svelte";
  import {
    GRID_MAX_TEAMS,
    GRID_MIN_TEAMS,
    GRID_STEP,
    SPORT_CONFIG,
  } from "$lib/domain/constants";
  import type { GenericTeam, TeamRow, Tournament } from "$lib/domain/types";
  import {
    action_go_match,
    action_ranking,
    action_reset,
    grid_reset_confirm,
    nav_home,
    nav_tournament,
    nav_tournaments,
    team_count_label,
    tournament_delete_button,
    tournament_delete_confirm,
    tournament_not_found,
  } from "$lib/paraglide/messages";
  import {
    deleteTournament,
    getTournamentById,
    updateTournament,
  } from "$lib/services/storage";
  import { resetGrid, resizeGrid } from "$lib/utils/grid";
  import { sortGridByRank } from "$lib/utils/ranking";

  let tournament = $state<Tournament | undefined>(undefined);
  let showResetConfirm = $state(false);
  let showDeleteConfirm = $state(false);
  let drawerOpen = $state(false);
  let selectedSlotId = $state<string | undefined>(undefined);

  const tournamentId = $derived(String($page.params.tournamentId));
  const sportConfig = $derived(
    tournament ? SPORT_CONFIG[tournament.type] : undefined
  );
  const teamCount = $derived(tournament ? tournament.grid.length : 0);
  const breadcrumbItems = $derived([
    { emoji: "🏠", label: nav_home(), href: `${base}/home` },
    { emoji: "🏆", label: nav_tournaments(), href: `${base}/tournaments` },
    { emoji: "📋", label: tournament ? tournament.name : nav_tournament() },
  ]);

  onMount(() => {
    tournament = getTournamentById(tournamentId);
  });

  function saveTournament(fn: (t: Tournament) => Tournament): void {
    if (!tournament) {
      return;
    }
    const updated = updateTournament(tournament.id, fn);
    if (updated) {
      tournament = updated;
    }
  }

  function handleDeleteTournament(): void {
    deleteTournament(tournamentId);
    goto(`${base}/tournaments`);
  }

  function handleResetGrid(): void {
    showResetConfirm = false;
    saveTournament((t) => ({
      ...t,
      grid: resetGrid(t.type),
      matchs: [],
    }));
  }

  function handleResizeGrid(newCount: number): void {
    if (!tournament) {
      return;
    }
    saveTournament((t) => ({
      ...t,
      grid: resizeGrid(t.grid, newCount, t.type),
    }));
  }

  function handleNameChange(newName: string): void {
    saveTournament((t) => ({ ...t, name: newName }));
  }

  function handleRanking(): void {
    if (!tournament) {
      return;
    }
    saveTournament((t) => ({
      ...t,
      grid: sortGridByRank(t.grid, t.matchs, t.type),
    }));
  }

  function handleSlotClick(slotId: string): void {
    selectedSlotId = slotId;
    drawerOpen = true;
  }

  function handleTeamSelect(team: GenericTeam): void {
    if (!(tournament && selectedSlotId)) {
      return;
    }
    saveTournament((t) => {
      const grid = t.grid.map((slot) => {
        if (slot.id === selectedSlotId) {
          return { ...slot, team };
        }
        return slot;
      });
      return { ...t, grid };
    });
    drawerOpen = false;
    selectedSlotId = undefined;
  }

  function handleDrawerClose(): void {
    drawerOpen = false;
    selectedSlotId = undefined;
  }

  function handleMagicFillup(newGrid: TeamRow[]): void {
    saveTournament((t) => ({
      ...t,
      grid: newGrid,
    }));
  }
</script>

<svelte:head>
  <title>{tournament ? tournament.name : nav_tournament()}</title>
</svelte:head>

<Breadcrumb items={breadcrumbItems} />

{#if tournament}
  <div class="flex flex-col items-center gap-6 mt-6">
    <TournamentHeader
      name={tournament.name}
      onNameChange={handleNameChange}
      sportType={tournament.type}
    />

    <div class="w-full max-w-md">
      <NumericField
        label={team_count_label()}
        min={GRID_MIN_TEAMS}
        max={GRID_MAX_TEAMS}
        step={GRID_STEP}
        value={teamCount}
        placeholder="4"
        onchange={handleResizeGrid}
      />
    </div>

    <div class="w-full">
      <GridTable
        grid={tournament.grid}
        matches={tournament.matchs}
        onSlotClick={handleSlotClick}
        sportType={tournament.type}
      />
    </div>

    <div class="w-full max-w-md">
      <ActionBar>
        <button
          type="button"
          class="btn btn-lg preset-tonal"
          onclick={() => (showResetConfirm = true)}
        >
          🗑 {action_reset()}
        </button>
        {#if sportConfig?.gridModel === "default"}
          <button
            type="button"
            class="btn btn-lg preset-tonal"
            onclick={handleRanking}
          >
            📊 {action_ranking()}
          </button>
        {/if}
        <a href="{base}/match/{tournamentId}" class="btn btn-lg preset-filled">
          🎮 {action_go_match()}
        </a>
        <NbaMagicFillupButton
          grid={tournament.grid}
          onFill={handleMagicFillup}
          sportType={tournament.type}
        />
      </ActionBar>
    </div>

    <hr class="hr w-full max-w-md">

    <div class="w-full max-w-md">
      <button
        type="button"
        class="btn btn-lg preset-filled bg-error-500 hover:bg-error-600 dark:bg-error-500 dark:hover:bg-error-600 w-full"
        onclick={() => (showDeleteConfirm = true)}
      >
        🗑 {tournament_delete_button()}
      </button>
    </div>
  </div>

  <ConfirmDialog
    open={showResetConfirm}
    message={grid_reset_confirm()}
    onCancel={() => (showResetConfirm = false)}
    onConfirm={handleResetGrid}
  />

  <ConfirmDialog
    open={showDeleteConfirm}
    message={tournament_delete_confirm({ name: tournament.name })}
    onCancel={() => (showDeleteConfirm = false)}
    onConfirm={handleDeleteTournament}
  />

  <TeamSearchDrawer
    open={drawerOpen}
    onOpenChange={(v) => {
      if (!v) {
        handleDrawerClose();
      }
    }}
    onSelect={handleTeamSelect}
    sportType={tournament.type}
  />
{:else}
  <ErrorMessage
    description={tournament_not_found({ id: tournamentId })}
    showHomeButton={true}
  />
{/if}
