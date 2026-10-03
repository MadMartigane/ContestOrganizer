<script lang="ts">
  import { DEFAULT_COLUMN_CLASSES } from "$lib/domain/constants";
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
  <!-- Cell order must match DEFAULT_COLUMN_CLASSES and the header order -->
  <td
    class="px-2 py-2 text-center text-sm text-surface-600 dark:text-surface-400 {DEFAULT_COLUMN_CLASSES[0]}"
  >
    {paddedRank}
  </td>
  <td class="px-2 py-2 {DEFAULT_COLUMN_CLASSES[1]}">
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
  <td
    class="px-2 py-2 text-center font-mono text-sm text-primary-600 dark:text-primary-400 font-bold {DEFAULT_COLUMN_CLASSES[2]}"
  >
    {slot.points}
  </td>
  <td
    class="px-2 py-2 text-center font-mono text-sm text-success-600 dark:text-success-400 {DEFAULT_COLUMN_CLASSES[3]}"
  >
    {slot.scoredGoals}
  </td>
  <td
    class="px-2 py-2 text-center font-mono text-sm text-success-600 dark:text-success-400 {DEFAULT_COLUMN_CLASSES[4]}"
  >
    {slot.concededGoals}
  </td>
  <td
    class="px-2 py-2 text-center font-mono text-sm text-warning-600 dark:text-warning-400 {DEFAULT_COLUMN_CLASSES[5]}"
  >
    {slot.goalAverage}
  </td>
  <td
    class="px-2 py-2 text-center font-mono text-sm {DEFAULT_COLUMN_CLASSES[6]}"
  >
    {slot.scheduledMatchs}
  </td>
</tr>
