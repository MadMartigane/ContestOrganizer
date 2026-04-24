<script lang="ts">
  import type { TeamRow } from "$lib/domain/types";
  import {
    grid_col_lost,
    grid_col_played,
    grid_col_rank,
    grid_col_scheduled,
    grid_col_teams,
    grid_col_win_percent,
    grid_col_won,
    team_empty,
  } from "$lib/paraglide/messages";
  import type { BasketTeamStats } from "$lib/utils/scoring";

  interface Props {
    onSlotClick: (slotId: string) => void;
    rank: number;
    slot: TeamRow;
    stats?: BasketTeamStats;
  }

  let { onSlotClick, rank, slot, stats }: Props = $props();

  const paddedRank = $derived(String(rank).padStart(2, "0"));
</script>

<tr
  class="border-b border-surface-200-800 hover:bg-surface-100-900 transition-colors"
>
  <td
    class="px-2 py-2 text-center text-sm text-surface-600 dark:text-surface-400"
  >
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
            >🏀</span
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
  <td class="px-2 py-2 text-center font-mono text-sm">
    {stats?.winGamesPercent ?? 0}%
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {stats?.playedGames ?? 0}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {stats?.winGames ?? 0}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {stats?.looseGames ?? 0}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm hidden sm:table-cell">
    {stats?.scoredPoints ?? 0}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm hidden sm:table-cell">
    {stats?.concededPoints ?? 0}
  </td>
  <td class="px-2 py-2 text-center font-mono text-sm">
    {stats?.scheduledMatchs ?? 0}
  </td>
</tr>
