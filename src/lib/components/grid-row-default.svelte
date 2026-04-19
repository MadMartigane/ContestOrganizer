<script lang="ts">
  import type { TeamRow } from "$lib/domain/types";
  import {
    grid_col_goal_avg,
    grid_col_goals_conceded,
    grid_col_goals_scored,
    grid_col_points,
    grid_col_rank,
    grid_col_scheduled,
    grid_col_teams,
    team_empty,
  } from "$lib/paraglide/messages";

  interface Props {
    onSlotClick: (slotId: string) => void;
    rank: number;
    slot: TeamRow;
  }

  let { onSlotClick, rank, slot }: Props = $props();

  const paddedRank = $derived(String(rank).padStart(2, "0"));

  function getRankBadgeClasses(r: number): string {
    if (r === 1) {
      return "bg-gradient-to-br from-yellow-400 to-yellow-700 border-2 border-yellow-300 text-white";
    }
    if (r === 2) {
      return "bg-gradient-to-br from-gray-200 to-gray-500 border-2 border-white text-gray-900";
    }
    if (r === 3) {
      return "bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-yellow-600 text-white";
    }
    return "bg-gradient-to-br from-blue-100 to-blue-400 border-2 border-white text-gray-900";
  }

  const rankBadgeClasses = $derived(getRankBadgeClasses(rank));
</script>

<tr
  class="border-b border-surface-200-800 hover:bg-surface-100-900 transition-colors"
>
  <td class="px-2 py-2 text-center">
    <div
      class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold {rankBadgeClasses}"
    >
      {paddedRank}
    </div>
  </td>
  <td class="px-2 py-2">
    {#if slot.team}
      <button
        type="button"
        class="flex items-center gap-2 w-full text-left cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        onclick={() => onSlotClick(slot.id)}
      >
        {#if slot.team.logo}
          <img
            src={slot.team.logo}
            alt={slot.team.name}
            class="w-6 h-6 object-contain"
          >
        {:else}
          <span class="w-6 h-6 flex items-center justify-center text-sm"
            >⚽</span
          >
        {/if}
        <span class="truncate font-medium">{slot.team.name}</span>
      </button>
    {:else}
      <button
        type="button"
        class="flex items-center gap-2 w-full text-left cursor-pointer text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        onclick={() => onSlotClick(slot.id)}
      >
        <span class="text-sm">⏳</span>
        <span class="truncate italic">{team_empty()}</span>
      </button>
    {/if}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm">{slot.points}</td>
  <td class="px-2 py-2 text-center font-mono text-sm">{slot.scoredGoals}</td>
  <td class="px-2 py-2 text-center font-mono text-sm">{slot.concededGoals}</td>
  <td class="px-2 py-2 text-center font-mono text-sm">{slot.goalAverage}</td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {slot.scheduledMatchs}
  </td>
</tr>
