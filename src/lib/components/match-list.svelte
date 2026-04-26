<script lang="ts">
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import { get } from "svelte/store";
  import MatchTile from "$lib/components/match-tile.svelte";
  import type {
    Match,
    MatchGoals,
    MatchListScrollApi,
    MatchStatus,
    Tournament,
  } from "$lib/domain/types";

  interface Props {
    onDelete: (matchId: string) => void;
    onGoalsChange: (matchId: string, goals: MatchGoals) => void;
    onScrollChange?: (scrollPercentage: number) => void;
    onStatusChange: (matchId: string, status: MatchStatus) => void;
    scrollApi?: MatchListScrollApi;
    tournament: Tournament;
  }

  let {
    tournament,
    onStatusChange,
    onDelete,
    onGoalsChange,
    onScrollChange,
    scrollApi = $bindable(),
  }: Props = $props();

  let scrollElement = $state<HTMLDivElement | undefined>(undefined);
  let autoScrollDone = $state(false);

  const virtualizer = createVirtualizer({
    count: 0,
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => 240,
  });

  // biome-ignore lint/correctness/noUnusedVariables: used via Svelte `use:` directive
  function measureItem(el: HTMLElement) {
    get(virtualizer).measureElement(el);
  }

  $effect(() => {
    const matchCount = tournament.matchs.length;
    const currentScrollElement = scrollElement;

    get(virtualizer).setOptions({
      count: matchCount,
      getScrollElement: () => currentScrollElement ?? null,
    });
  });

  // Auto-scroll on load: last DOING match, fallback last DONE match
  $effect(() => {
    if (autoScrollDone) {
      return;
    }
    if (!scrollElement || tournament.matchs.length === 0) {
      return;
    }

    const doingIndex = tournament.matchs.findLastIndex(
      (m) => m.status === "DOING"
    );
    if (doingIndex !== -1) {
      get(virtualizer).scrollToIndex(doingIndex, {
        align: "center",
        behavior: "smooth",
      });
      autoScrollDone = true;
      return;
    }

    let doneIndex = -1;
    for (let i = tournament.matchs.length - 1; i >= 0; i--) {
      if (tournament.matchs[i].status === "DONE") {
        doneIndex = i;
        break;
      }
    }
    if (doneIndex !== -1) {
      get(virtualizer).scrollToIndex(doneIndex, {
        align: "center",
        behavior: "smooth",
      });
    }
    autoScrollDone = true;
  });

  // Populate scrollApi for external navigation
  scrollApi = {
    scrollToBottom: () => {
      if (scrollElement) {
        scrollElement.scrollTo({
          behavior: "smooth",
          top: scrollElement.scrollHeight,
        });
      }
    },
    scrollToIndex: (
      index: number,
      align: "center" | "end" | "start" = "center"
    ) => {
      const virtualizerInstance = get(virtualizer);
      if (virtualizerInstance) {
        virtualizerInstance.scrollToIndex(index, { align, behavior: "smooth" });
      }
    },
    scrollToTop: () => {
      scrollElement?.scrollTo({ behavior: "smooth", top: 0 });
    },
  };

  let rafId = 0;

  function handleScroll(): void {
    if (rafId) {
      return;
    }
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!(scrollElement && onScrollChange)) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const maxScroll = scrollHeight - clientHeight;
      const percentage = maxScroll <= 0 ? 0 : (scrollTop / maxScroll) * 100;
      onScrollChange(percentage);
    });
  }
</script>

<div
  bind:this={scrollElement}
  class="overflow-y-auto"
  style="max-height: 70vh; min-height: 200px;"
  onscroll={handleScroll}
>
  <div style="height: {$virtualizer.getTotalSize()}px; position: relative;">
    {#each $virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
      <div
        use:measureItem
        style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualRow.start}px);"
        data-index={virtualRow.index}
      >
        <MatchTile
          match={tournament.matchs[virtualRow.index]}
          grid={tournament.grid}
          matches={tournament.matchs}
          sportType={tournament.type}
          {onStatusChange}
          {onDelete}
          {onGoalsChange}
        />
      </div>
    {/each}
  </div>
</div>
