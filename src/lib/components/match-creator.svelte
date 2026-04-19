<script lang="ts">
  import TeamTile from "$lib/components/team-tile.svelte";
  import type { Match, TeamRow } from "$lib/domain/types";
  import {
    action_cancel,
    match_new,
    match_select_host,
    match_select_visitor,
    match_validate,
  } from "$lib/paraglide/messages";
  import { createMatch } from "$lib/utils/match";

  interface Props {
    grid: TeamRow[];
    onCancel: () => void;
    onCreateMatch: (match: Match) => void;
  }

  let { grid, onCreateMatch, onCancel }: Props = $props();

  let selectedHostId = $state<string | undefined>(undefined);
  let selectedVisitorId = $state<string | undefined>(undefined);

  const teamsWithAssignments = $derived(
    grid.filter((slot) => slot.team !== undefined)
  );

  const canValidate = $derived(
    selectedHostId !== undefined &&
      selectedVisitorId !== undefined &&
      selectedHostId !== selectedVisitorId
  );

  function handleSlotClick(slotId: string): void {
    if (selectedHostId === slotId) {
      selectedHostId = undefined;
      return;
    }
    if (selectedVisitorId === slotId) {
      selectedVisitorId = undefined;
      return;
    }
    if (selectedHostId === undefined) {
      selectedHostId = slotId;
    } else if (selectedVisitorId === undefined) {
      selectedVisitorId = slotId;
    } else {
      selectedVisitorId = slotId;
    }
  }

  function handleValidate(): void {
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

  function slotRingClass(slotId: string): string {
    if (slotId === selectedHostId) {
      return "ring-2 ring-primary-500";
    }
    if (slotId === selectedVisitorId) {
      return "ring-2 ring-secondary-500";
    }
    return "";
  }

  function slotVariant(slotId: string): "normal" | "reverse" {
    if (slotId === selectedVisitorId) {
      return "reverse";
    }
    return "normal";
  }

  // Reference functions in $derived to satisfy Biome's noUnusedVariables rule
  // since it doesn't detect Svelte template usage
  const _used = $derived.by(() => [slotRingClass, slotVariant]);
</script>

<div class="card bg-surface-100-900 p-4 space-y-4">
  <h3 class="text-lg font-bold">{match_new()}</h3>

  {#if selectedHostId === undefined}
    <p class="text-sm text-surface-500">{match_select_host()}</p>
  {:else if selectedVisitorId === undefined}
    <p class="text-sm text-surface-500">{match_select_visitor()}</p>
  {:else}
    <p class="text-sm text-surface-500">{match_select_visitor()}</p>
  {/if}

  <div class="space-y-2">
    {#each teamsWithAssignments as slot (slot.id)}
      <button
        type="button"
        class="w-full text-left rounded-lg transition-all {slotRingClass(slot.id)}"
        onclick={() => handleSlotClick(slot.id)}
      >
        <TeamTile team={slot.team} variant={slotVariant(slot.id)} />
      </button>
    {/each}
  </div>

  <div class="flex justify-end gap-2 pt-2">
    <button type="button" class="btn preset-tonal" onclick={onCancel}>
      {action_cancel()}
    </button>
    <button
      type="button"
      class="btn preset-filled"
      disabled={!canValidate}
      onclick={handleValidate}
    >
      {match_validate()}
    </button>
  </div>
</div>
