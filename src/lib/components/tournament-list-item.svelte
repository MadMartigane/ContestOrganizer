<script lang="ts">
  import { goto } from "$app/navigation";
  import ConfirmDialog from "$lib/components/confirm-dialog.svelte";
  import { SPORT_CONFIG } from "$lib/domain/constants";
  import type { Tournament } from "$lib/domain/types";
  import { tournament_delete_confirm } from "$lib/paraglide/messages";

  interface Props {
    onDelete: (id: string) => void;
    tournament: Tournament;
  }

  let { onDelete, tournament }: Props = $props();
  let showConfirm = $state(false);

  const config = $derived(SPORT_CONFIG[tournament.type]);
  const teamCount = $derived(tournament.grid.length);

  function handleNavigate(): void {
    goto(`/tournament/${tournament.id}`);
  }

  function handleDeleteClick(e: MouseEvent): void {
    e.stopPropagation();
    showConfirm = true;
  }

  function handleConfirmDelete(): void {
    showConfirm = false;
    onDelete(tournament.id);
  }

  function handleCancelDelete(): void {
    showConfirm = false;
  }
</script>

<!-- Clickable row -->
<div
  role="button"
  tabindex="0"
  class="flex items-center justify-between w-full p-3 rounded-lg bg-surface-50-950 hover:bg-surface-100-900 transition-colors cursor-pointer"
  onclick={handleNavigate}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleNavigate();
    }
  }}
>
  <div class="flex items-center gap-3">
    <span class="text-2xl">{config.emoji}</span>
    <span class="font-medium text-surface-700 dark:text-surface-300"
      >{tournament.name}</span
    >
    <span
      class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
    >
      {teamCount}
    </span>
  </div>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="btn btn-sm preset-tonal text-error-500"
      onclick={handleDeleteClick}
      aria-label="Delete"
    >
      🗑
    </button>
    <span class="text-surface-500">➡</span>
  </div>
</div>

<ConfirmDialog
  open={showConfirm}
  message={tournament_delete_confirm({ name: tournament.name })}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
/>
