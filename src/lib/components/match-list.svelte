<script lang="ts">
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import MatchTile from "$lib/components/match-tile.svelte";
  import type {
    Match,
    MatchGoals,
    MatchStatus,
    Tournament,
  } from "$lib/domain/types";

  interface Props {
    onDelete: (matchId: string) => void;
    onGoalsChange: (matchId: string, goals: MatchGoals) => void;
    onStatusChange: (matchId: string, status: MatchStatus) => void;
    tournament: Tournament;
  }

  let { tournament, onStatusChange, onDelete, onGoalsChange }: Props = $props();

  let scrollElement = $state<HTMLDivElement | undefined>(undefined);

  const virtualizer = createVirtualizer({
    count: tournament.matchs.length,
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => 120,
  });

  // Auto-scroll on load: first DOING match, then last DONE match
  $effect(() => {
    if (!scrollElement || tournament.matchs.length === 0) {
      return;
    }
    const doingIndex = tournament.matchs.findIndex((m) => m.status === "DOING");
    if (doingIndex !== -1) {
      $virtualizer.scrollToIndex(doingIndex, { align: "center" });
      return;
    }
    const doneIndex = tournament.matchs.findLastIndex(
      (m) => m.status === "DONE"
    );
    if (doneIndex !== -1) {
      $virtualizer.scrollToIndex(doneIndex, { align: "center" });
    }
  });
</script>

<div
  bind:this={scrollElement}
  class="overflow-y-auto"
  style="max-height: 70vh;"
>
  <div style="height: {$virtualizer.getTotalSize()}px; position: relative;">
    {#each $virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
      <div
        style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualRow.start}px);"
        data-index={virtualRow.index}
      >
        <MatchTile
          match={tournament.matchs[virtualRow.index]}
          grid={tournament.grid}
          sportType={tournament.type}
          {onStatusChange}
          {onDelete}
          {onGoalsChange}
        />
      </div>
    {/each}
  </div>
</div>
