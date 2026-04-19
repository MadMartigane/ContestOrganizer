<script lang="ts">
  import ActionBar from "$lib/components/action-bar.svelte";
  import {
    DEFAULT_SPORT,
    SPORT_CONFIG,
    SPORT_OPTIONS,
  } from "$lib/domain/constants";
  import type { TournamentType } from "$lib/domain/types";
  import {
    action_add,
    action_cancel,
    sport_selector_help,
    sport_selector_label,
    sport_selector_placeholder,
    tournament_name_label,
    tournament_name_placeholder,
  } from "$lib/paraglide/messages";

  interface Props {
    onAdd: (name: string, type: TournamentType) => void;
    onCancel: () => void;
  }

  let { onAdd, onCancel }: Props = $props();

  let name = $state("");
  let selectedSport = $state<TournamentType>(DEFAULT_SPORT);
  // biome-ignore lint/suspicious/noUnassignedVariables: Svelte bind:this assigns at runtime
  let nameInputEl: HTMLInputElement | undefined;

  const MIN_NAME_LENGTH = 3;
  const canSubmit = $derived(name.trim().length >= MIN_NAME_LENGTH);

  function handleSubmit(): void {
    if (!canSubmit) {
      return;
    }
    onAdd(name.trim(), selectedSport);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const selectEl = document.getElementById("sport-selector");
      if (selectEl) {
        selectEl.focus();
      }
    }
  }

  $effect(() => {
    nameInputEl?.focus();
  });
</script>

<div class="card bg-surface-50-950 p-4 space-y-4" onkeydown={handleKeydown}>
  <div class="flex flex-col gap-2">
    <label
      for="tournament-name"
      class="text-sm font-medium text-surface-700 dark:text-surface-300"
    >
      {tournament_name_label()}
    </label>
    <input
      id="tournament-name"
      type="text"
      bind:this={nameInputEl}
      bind:value={name}
      placeholder={tournament_name_placeholder()}
      class="input"
    >
  </div>

  <div class="flex flex-col gap-2">
    <label
      for="sport-selector"
      class="text-sm font-medium text-surface-700 dark:text-surface-300"
    >
      {sport_selector_label()}
    </label>
    <select id="sport-selector" bind:value={selectedSport} class="select">
      {#each SPORT_OPTIONS as sportType}
        <option value={sportType}>
          {SPORT_CONFIG[sportType].emoji} {SPORT_CONFIG[sportType].label}
        </option>
      {/each}
    </select>
    <p class="text-xs text-surface-500">{sport_selector_help()}</p>
  </div>

  <ActionBar>
    <button type="button" class="btn preset-tonal" onclick={onCancel}>
      {action_cancel()}
    </button>
    <button
      type="button"
      class="btn preset-filled"
      onclick={handleSubmit}
      disabled={!canSubmit}
    >
      {action_add()}
    </button>
  </ActionBar>
</div>
