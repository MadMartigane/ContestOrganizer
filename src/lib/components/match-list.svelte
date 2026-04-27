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
    const matches = tournament.matchs;
    const el = scrollElement;

    if (!el || matches.length === 0) {
      return;
    }

    const doingIndex = matches.findLastIndex((m) => m.status === "DOING");
    const targetIndex =
      doingIndex === -1
        ? matches.findLastIndex((m) => m.status === "DONE")
        : doingIndex;

    if (targetIndex === -1) {
      autoScrollDone = true;
      return;
    }

    requestAnimationFrame(() => {
      const v = get(virtualizer);
      if (targetIndex < v.options.count) {
        v.scrollToIndex(targetIndex, { align: "center", behavior: "auto" });
      }
      autoScrollDone = true;
    });
  });

  // Populate scrollApi for external navigation
  scrollApi = {
    scrollToBottom: () => {
      const v = get(virtualizer);
      const lastIndex = v.options.count - 1;
      if (lastIndex < 0) {
        return;
      }
      v.scrollToIndex(lastIndex, { align: "end", behavior: "auto" });
    },
    scrollToIndex: (
      index: number,
      align: "center" | "end" | "start" = "center"
    ) => {
      const v = get(virtualizer);
      if (index < 0 || index >= v.options.count) {
        return;
      }
      v.scrollToIndex(index, { align, behavior: "auto" });
    },
    scrollToTop: () => {
      const v = get(virtualizer);
      if (v.options.count <= 0) {
        return;
      }
      v.scrollToIndex(0, { align: "start", behavior: "auto" });
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
