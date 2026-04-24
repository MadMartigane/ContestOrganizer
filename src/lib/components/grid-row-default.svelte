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

</script>

<tr
  class="border-b border-surface-200-800 hover:bg-surface-100-900 transition-colors"
>
  <td class="px-2 py-2 text-center text-sm text-surface-600 dark:text-surface-400">
    {paddedRank}
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
  <td class="px-2 py-2 text-center font-mono text-sm text-primary-600 dark:text-primary-400 font-bold">{slot.points}</td>
  <td class="px-2 py-2 text-center font-mono text-sm text-success-600 dark:text-success-400 hidden sm:table-cell">{slot.scoredGoals}</td>
  <td class="px-2 py-2 text-center font-mono text-sm text-success-600 dark:text-success-400 hidden sm:table-cell">{slot.concededGoals}</td>
  <td class="px-2 py-2 text-center font-mono text-sm text-warning-600 dark:text-warning-400 hidden sm:table-cell">{slot.goalAverage}</td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {slot.scheduledMatchs}
  </td>
</tr>
