<script lang="ts">
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type { TournamentType } from "$lib/domain/types";
  import { tournament_edit_name } from "$lib/paraglide/messages";

  interface Props {
    name: string;
    onNameChange: (newName: string) => void;
    sportType: TournamentType;
  }

  let { name, onNameChange, sportType }: Props = $props();

  let isEditing = $state(false);
  let editValue = $state("");

  const sportConfig = $derived(SPORT_CONFIG[sportType]);

  function startEditing(): void {
    editValue = name;
    isEditing = true;
  }

  function saveEdit(): void {
    const trimmed = editValue.trim();
    if (trimmed.length > 0) {
      onNameChange(trimmed);
    }
    isEditing = false;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === "Escape") {
      saveEdit();
    }
  }
</script>

<div class="flex items-center gap-3 flex-wrap">
  <span
    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-surface-200-800 select-none"
  >
    <span aria-hidden="true">{sportConfig.emoji}</span>
    <span>{sportConfig.label}</span>
  </span>

  {#if isEditing}
    <input
      type="text"
      bind:value={editValue}
      onkeydown={handleKeydown}
      onblur={saveEdit}
      class="input text-xl font-bold flex-1 min-w-0"
      placeholder={tournament_edit_name()}
      aria-label={tournament_edit_name()}
    >
  {:else}
    <button
      type="button"
      class="text-xl font-bold cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate bg-transparent border-0 p-0 m-0"
      onclick={startEditing}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          startEditing();
        }
      }}
      title={tournament_edit_name()}
    >
      {name}
    </button>
  {/if}
</div>
