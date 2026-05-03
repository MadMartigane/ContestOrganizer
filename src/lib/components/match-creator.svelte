<script lang="ts">
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type { Match, TeamRow, TournamentType } from "$lib/domain/types";
  import {
    action_cancel,
    match_creator_col_played,
    match_creator_col_scheduled,
    match_creator_col_total,
    match_new,
    match_select_host,
    match_select_visitor,
    match_validate,
  } from "$lib/paraglide/messages";
  import {
    buildTeamMatchStats,
    createMatch,
    type TeamMatchStats,
  } from "$lib/utils/match";

  /** Team row augmented with match stats */
  interface TeamRowWithStats {
    slot: TeamRow;
    stats: TeamMatchStats;
  }

  interface Props {
    grid: TeamRow[];
    matches: Match[];
    onCancel: () => void;
    onCreateMatch: (match: Match) => void;
    sportType: TournamentType;
  }

  let { grid, matches, onCreateMatch, onCancel, sportType }: Props = $props();

  const sportConfig = $derived(SPORT_CONFIG[sportType]);

  const sortedTeams = $derived.by(() => {
    const statMap = buildTeamMatchStats(grid, matches);
    const teams: TeamRowWithStats[] = [];
    for (const slot of grid) {
      if (slot.team === undefined) {
        continue;
      }
      const stats = statMap.get(slot.id) ?? {
        total: 0,
        played: 0,
        scheduled: 0,
      };
      teams.push({ slot, stats });
    }
    // Sort: played ASC, then scheduled DESC
    teams.sort((a, b) => {
      if (a.stats.played !== b.stats.played) {
        return a.stats.played - b.stats.played;
      }
      return b.stats.scheduled - a.stats.scheduled;
    });
    return teams;
  });

  let selectedHostId = $state<string | undefined>(undefined);
  let selectedVisitorId = $state<string | undefined>(undefined);

  const canValidate = $derived(
    selectedHostId !== undefined &&
      selectedVisitorId !== undefined &&
      selectedHostId !== selectedVisitorId
  );

  function isSelected(slotId: string): boolean {
    return slotId === selectedHostId || slotId === selectedVisitorId;
  }

  function rowClass(slotId: string): string {
    if (slotId === selectedHostId) {
      return "bg-primary-500/10";
    }
    if (slotId === selectedVisitorId) {
      return "bg-secondary-500/10";
    }
    return "hover:bg-surface-50-950";
  }

  function nameClass(slotId: string): string {
    if (slotId === selectedHostId) {
      return "text-primary-600 dark:text-primary-400";
    }
    if (slotId === selectedVisitorId) {
      return "text-secondary-600 dark:text-secondary-400";
    }
    return "";
  }

  function handleSlotClick(slotId: string) {
    if (selectedHostId === slotId) {
      // Deselect host
      selectedHostId = undefined;
      // If visitor was selected, promote to host
      if (selectedVisitorId !== undefined) {
        selectedHostId = selectedVisitorId;
        selectedVisitorId = undefined;
      }
    } else if (selectedVisitorId === slotId) {
      // Deselect visitor
      selectedVisitorId = undefined;
    } else if (selectedHostId === undefined) {
      // Select as host
      selectedHostId = slotId;
    } else if (selectedVisitorId === undefined) {
      // Select as visitor
      selectedVisitorId = slotId;
    }
    // If both already selected, do nothing (user must deselect first)
  }

  function handleValidate() {
    if (
      !canValidate ||
      selectedHostId === undefined ||
      selectedVisitorId === undefined
    ) {
      return;
    }
    const match = createMatch(selectedHostId, selectedVisitorId);
    onCreateMatch(match);
  }

  // Reference functions in $derived to satisfy Biome's noUnusedVariables rule
  // since it doesn't detect Svelte template usage
  const _used = $derived.by(() => [isSelected, rowClass, nameClass]);
</script>

<div class="card bg-surface-100-900 p-4 space-y-4">
  <h3 class="text-lg font-bold">{match_new()}</h3>

  {#if selectedHostId === undefined}
    <p class="text-sm text-surface-500">{match_select_host()}</p>
  {:else if selectedVisitorId === undefined}
    <p class="text-sm text-surface-500">{match_select_visitor()}</p>
  {:else}
    <p class="text-sm text-surface-500">
      {sportConfig.emoji} {match_validate()} ?
    </p>
  {/if}

  <!-- Selection table -->
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-surface-200-800 text-surface-500">
          <th class="w-10 px-2 py-2 text-center">✓</th>
          <th class="px-2 py-2 text-left">Team</th>
          <th class="w-14 px-2 py-2 text-center">
            {match_creator_col_total()}
          </th>
          <th class="w-14 px-2 py-2 text-center">
            {match_creator_col_played()}
          </th>
          <th class="w-14 px-2 py-2 text-center">
            {match_creator_col_scheduled()}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each sortedTeams as { slot, stats } (slot.id)}
          <tr
            class="border-b border-surface-200-800 cursor-pointer transition-colors {rowClass(slot.id)}"
            onclick={() => handleSlotClick(slot.id)}
            role="button"
            tabindex={0}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSlotClick(slot.id);
              }
            }}
          >
            <td class="px-2 py-2 text-center">
              <input
                type="checkbox"
                checked={isSelected(slot.id)}
                readonly
                class="pointer-events-none"
                tabindex={-1}
                aria-hidden="true"
              >
            </td>
            <td class="px-2 py-2">
              <div class="flex items-center gap-2">
                {#if slot.team?.logo}
                  <img
                    src={slot.team.logo}
                    alt=""
                    class="w-8 h-8 object-contain flex-shrink-0"
                  >
                {:else}
                  <div
                    class="w-8 h-8 flex-shrink-0 flex items-center justify-center text-surface-500"
                  >
                    ⏳
                  </div>
                {/if}
                <span class="truncate font-medium {nameClass(slot.id)}">
                  {slot.team?.name ?? "—"}
                </span>
              </div>
            </td>
            <td class="px-2 py-2 text-center font-mono">{stats.total}</td>
            <td class="px-2 py-2 text-center font-mono">{stats.played}</td>
            <td class="px-2 py-2 text-center font-mono">{stats.scheduled}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="flex justify-end gap-2 pt-2">
    <button type="button" class="btn btn-lg preset-tonal" onclick={onCancel}>
      {action_cancel()}
    </button>
    <button
      type="button"
      class="btn btn-lg preset-filled"
      disabled={!canValidate}
      onclick={handleValidate}
    >
      {match_validate()}
    </button>
  </div>
</div>
