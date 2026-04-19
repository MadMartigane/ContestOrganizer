<script lang="ts">
  import GridRowBasket from "$lib/components/grid-row-basket.svelte";
  import GridRowDefault from "$lib/components/grid-row-default.svelte";
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type { Match, TeamRow, TournamentType } from "$lib/domain/types";
  import {
    grid_col_goal_avg,
    grid_col_goals_conceded,
    grid_col_goals_scored,
    grid_col_lost,
    grid_col_played,
    grid_col_points,
    grid_col_rank,
    grid_col_scheduled,
    grid_col_teams,
    grid_col_win_percent,
    grid_col_won,
    grid_empty,
    grid_legend_conceded,
    grid_legend_lost,
    grid_legend_percent,
    grid_legend_played,
    grid_legend_scheduled,
    grid_legend_scored,
    grid_legend_won,
  } from "$lib/paraglide/messages";
  import { getRankMap, sortGridByRank } from "$lib/utils/ranking";
  import { type BasketTeamStats, computeBasketStats } from "$lib/utils/scoring";

  interface Props {
    grid: TeamRow[];
    matches: Match[];
    onSlotClick: (slotId: string) => void;
    sportType: TournamentType;
  }

  let { grid, matches, onSlotClick, sportType }: Props = $props();

  const sportConfig = $derived(SPORT_CONFIG[sportType]);
  const isBasket = $derived(sportConfig.gridModel === "basket");

  const sortedGrid = $derived(
    isBasket ? sortGridByRank(grid, matches, sportType) : grid
  );

  const rankMap = $derived(getRankMap(grid, matches, sportType));

  const basketStats = $derived(
    isBasket ? computeBasketStats(grid, matches) : undefined
  );

  function getSlotRank(slotId: string): number {
    return rankMap.get(slotId) ?? 0;
  }

  function getSlotStats(slotId: string): BasketTeamStats | undefined {
    if (!basketStats) {
      return;
    }
    return basketStats.get(slotId);
  }
</script>

{#if grid.length === 0}
  <p class="text-center text-surface-500 py-8">{grid_empty()}</p>
{:else}
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        {#if isBasket}
          <tr class="border-b border-surface-200-800 text-surface-500">
            <th class="px-2 py-2 text-center">{grid_col_rank()}</th>
            <th class="px-2 py-2 text-left">{grid_col_teams()}</th>
            <th class="px-2 py-2 text-center hidden sm:table-cell">
              {grid_col_win_percent()}
            </th>
            <th class="px-2 py-2 text-center">{grid_col_played()}</th>
            <th class="px-2 py-2 text-center">{grid_col_won()}</th>
            <th class="px-2 py-2 text-center">{grid_col_lost()}</th>
            <th class="px-2 py-2 text-center hidden sm:table-cell">
              {grid_col_goals_scored()}
            </th>
            <th class="px-2 py-2 text-center hidden sm:table-cell">
              {grid_col_goals_conceded()}
            </th>
            <th class="px-2 py-2 text-center">{grid_col_scheduled()}</th>
          </tr>
        {:else}
          <tr class="border-b border-surface-200-800 text-surface-500">
            <th class="px-2 py-2 text-center">{grid_col_rank()}</th>
            <th class="px-2 py-2 text-left">{grid_col_teams()}</th>
            <th class="px-2 py-2 text-center">{grid_col_points()}</th>
            <th class="px-2 py-2 text-center hidden sm:table-cell">
              {grid_col_goals_scored()}
            </th>
            <th class="px-2 py-2 text-center hidden sm:table-cell">
              {grid_col_goals_conceded()}
            </th>
            <th class="px-2 py-2 text-center">{grid_col_goal_avg()}</th>
            <th class="px-2 py-2 text-center">{grid_col_scheduled()}</th>
          </tr>
        {/if}
      </thead>
      <tbody>
        {#each sortedGrid as slot (slot.id)}
          {#if isBasket}
            <GridRowBasket
              {onSlotClick}
              rank={getSlotRank(slot.id)}
              {slot}
              stats={getSlotStats(slot.id)}
            />
          {:else}
            <GridRowDefault {onSlotClick} rank={getSlotRank(slot.id)} {slot} />
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  {#if isBasket}
    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
      <span><strong>%</strong> {grid_legend_percent()}</span>
      <span><strong>J</strong> {grid_legend_played()}</span>
      <span><strong>G</strong> {grid_legend_won()}</span>
      <span><strong>P</strong> {grid_legend_lost()}</span>
      <span><strong>+</strong> {grid_legend_scored()}</span>
      <span><strong>−</strong> {grid_legend_conceded()}</span>
      <span><strong>📅</strong> {grid_legend_scheduled()}</span>
    </div>
  {/if}
{/if}
