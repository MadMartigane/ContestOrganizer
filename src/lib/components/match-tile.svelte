<script lang="ts">
  import ConfirmDialog from "$lib/components/confirm-dialog.svelte";
  import MatchScorer from "$lib/components/match-scorer.svelte";
  import TeamTile from "$lib/components/team-tile.svelte";
  import { MATCH_STATUS_CONFIG, SPORT_CONFIG } from "$lib/domain/constants";
  import type {
    Match,
    MatchGoals,
    MatchStatus,
    TeamRow,
    TournamentType,
  } from "$lib/domain/types";
  import {
    match_delete_confirm,
    match_play,
    match_reopen,
    match_status_doing,
    match_status_done,
    match_status_pending,
    match_stop,
    match_vs,
  } from "$lib/paraglide/messages";

  interface Props {
    grid: TeamRow[];
    match: Match;
    onDelete: (matchId: string) => void;
    onGoalsChange: (matchId: string, goals: MatchGoals) => void;
    onStatusChange: (matchId: string, status: MatchStatus) => void;
    sportType: TournamentType;
  }

  let {
    match,
    grid,
    sportType,
    onStatusChange,
    onDelete,
    onGoalsChange,
  }: Props = $props();

  const hostSlot = $derived(grid.find((s) => s.id === match.hostId));
  const visitorSlot = $derived(grid.find((s) => s.id === match.visitorId));
  const hostTeam = $derived(hostSlot?.team);
  const visitorTeam = $derived(visitorSlot?.team);
  const statusConfig = $derived(MATCH_STATUS_CONFIG[match.status]);
  const sportConfig = $derived(SPORT_CONFIG[sportType]);

  let showDeleteConfirm = $state(false);

  const statusLabel = $derived.by(() => {
    if (match.status === "PENDING") {
      return match_status_pending();
    }
    if (match.status === "DOING") {
      return match_status_doing();
    }
    return match_status_done();
  });

  const badgeClass = $derived.by(() => {
    if (statusConfig.color === "primary") {
      return "bg-primary-500/20 text-primary-600 dark:text-primary-400";
    }
    if (statusConfig.color === "success") {
      return "bg-success-500/20 text-success-600 dark:text-success-400";
    }
    return "bg-warning-500/20 text-warning-600 dark:text-warning-400";
  });

  const actionButtonClass = $derived.by(() => {
    if (match.status === "DOING") {
      return "btn preset-filled bg-warning-500 hover:bg-warning-600 dark:bg-warning-500 dark:hover:bg-warning-600";
    }
    if (match.status === "DONE") {
      return "btn preset-tonal";
    }
    return "btn preset-filled";
  });

  const actionLabel = $derived.by(() => {
    if (match.status === "PENDING") {
      return match_play();
    }
    if (match.status === "DOING") {
      return match_stop();
    }
    return match_reopen();
  });

  const actionIcon = $derived.by(() => {
    if (match.status === "PENDING") {
      return "▶";
    }
    if (match.status === "DOING") {
      return "⏹";
    }
    return "🔄";
  });

  function handleStatusToggle(): void {
    if (match.status === "PENDING") {
      onStatusChange(match.id, "DOING");
    } else if (match.status === "DOING") {
      onStatusChange(match.id, "DONE");
    } else if (match.status === "DONE") {
      onStatusChange(match.id, "DOING");
    }
  }

  function handleGoalsChange(goals: MatchGoals): void {
    onGoalsChange(match.id, goals);
  }

  function confirmDelete(): void {
    showDeleteConfirm = false;
    onDelete(match.id);
  }
</script>

<div class="card bg-surface-100-900 p-4 space-y-3">
  <!-- Teams row -->
  <div class="flex items-center gap-2">
    <div class="flex-1 min-w-0">
      <TeamTile team={hostTeam} variant="normal" />
    </div>
    <span class="text-lg font-bold text-surface-500 px-2">{match_vs()}</span>
    <div class="flex-1 min-w-0">
      <TeamTile team={visitorTeam} variant="reverse" />
    </div>
  </div>

  <!-- Score display -->
  <div class="flex items-center justify-center gap-4 text-2xl font-bold">
    <span class="text-primary-600 dark:text-primary-400"
      >{match.goals.host}</span
    >
    <span class="text-surface-500">-</span>
    <span class="text-secondary-600 dark:text-secondary-400"
      >{match.goals.visitor}</span
    >
  </div>

  <!-- Status badge -->
  <div class="flex items-center justify-center">
    <span
      class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium {badgeClass}"
    >
      {statusLabel}
    </span>
  </div>

  <!-- Scorer (only when DOING) -->
  {#if match.status === "DOING"}
    <MatchScorer
      goals={match.goals}
      scorerType={sportConfig.scorerType}
      disabled={false}
      onGoalsChange={handleGoalsChange}
    />
  {/if}

  <!-- Action buttons -->
  <div class="flex items-center justify-center gap-2 pt-1">
    <button
      type="button"
      class={actionButtonClass}
      onclick={handleStatusToggle}
    >
      {actionIcon} {actionLabel}
    </button>
    <button
      type="button"
      class="btn preset-tonal text-error-500"
      onclick={() => (showDeleteConfirm = true)}
    >
      🗑
    </button>
  </div>
</div>

<ConfirmDialog
  open={showDeleteConfirm}
  message={match_delete_confirm()}
  onCancel={() => (showDeleteConfirm = false)}
  onConfirm={confirmDelete}
/>
