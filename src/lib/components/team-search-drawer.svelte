<script lang="ts">
  import { Dialog } from "@skeletonlabs/skeleton-svelte";
  import type { GenericTeam, TournamentType } from "$lib/domain/types";
  import {
    action_cancel,
    team_search_loading,
    team_search_no_results,
    team_search_placeholder,
    team_search_title,
  } from "$lib/paraglide/messages";
  import { createTeamSearchQuery } from "$lib/services/team-queries";
  import {
    type ApiErrorType,
    TeamSearchError,
  } from "$lib/services/team-search";
  import ApiErrorAlert from "./api-error-alert.svelte";

  interface Props {
    onOpenChange: (open: boolean) => void;
    onSelect: (team: GenericTeam) => void;
    open: boolean;
    sportType: TournamentType;
  }

  let { open, onOpenChange, onSelect, sportType }: Props = $props();

  let searchQuery = $state("");
  let debouncedQuery = $state("");

  // Debounce: 300ms after last keystroke
  $effect(() => {
    const timer = setTimeout(() => {
      debouncedQuery = searchQuery;
    }, 300);
    return () => clearTimeout(timer);
  });

  const isSearchEnabled = $derived(debouncedQuery.trim().length >= 3);
  const teamQuery = createTeamSearchQuery(sportType, debouncedQuery);

  const errorType = $derived<ApiErrorType | null>(
    teamQuery.isError && teamQuery.error instanceof TeamSearchError
      ? teamQuery.error.type
      : null
  );

  function handleClose(): void {
    searchQuery = "";
    debouncedQuery = "";
    onOpenChange(false);
  }

  function handleSelect(team: GenericTeam): void {
    onSelect(team);
    searchQuery = "";
    debouncedQuery = "";
    onOpenChange(false);
  }
</script>

<Dialog
  {open}
  onOpenChange={(details) => {
    if (!details.open) {
      handleClose();
    }
  }}
  closeOnInteractOutside={true}
>
  <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
  <Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
    <Dialog.Content
      class="h-full w-full max-w-md bg-surface-100-900 shadow-xl overflow-y-auto p-4 space-y-4"
    >
      <!-- Header with title and close button -->
      <div class="flex items-center justify-between">
        <Dialog.Title class="text-lg font-bold">
          {team_search_title()}
        </Dialog.Title>
        <button type="button" class="btn preset-tonal" onclick={handleClose}>
          ✕
        </button>
      </div>

      <!-- Search input -->
      <input
        type="text"
        bind:value={searchQuery}
        placeholder={team_search_placeholder()}
        class="input w-full"
      >

      <!-- Results states -->
      {#if !isSearchEnabled}
        <p class="text-surface-500 text-center">{team_search_placeholder()}</p>
      {:else if teamQuery.isFetching}
        <p class="text-surface-500 text-center">{team_search_loading()}</p>
      {:else if teamQuery.isError && errorType}
        <ApiErrorAlert type={errorType} onRetry={() => teamQuery.refetch()} />
      {:else if teamQuery.isError}
        <ApiErrorAlert type="client" />
      {:else if teamQuery.data && teamQuery.data.length === 0}
        <p class="text-surface-500 text-center">
          😞 {team_search_no_results()}
        </p>
      {:else if teamQuery.data}
        {#each teamQuery.data as team (team.id)}
          <button
            type="button"
            class="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-surface-50-950/50 transition-colors"
            onclick={() => handleSelect(team)}
          >
            {#if team.logo}
              <img
                src={team.logo}
                alt={team.name}
                class="w-8 h-8 object-contain"
              >
            {:else}
              <div
                class="w-8 h-8 bg-surface-50-950 rounded-full flex items-center justify-center text-sm"
              >
                ⚽
              </div>
            {/if}
            <div class="flex-1 text-left">
              <p class="font-medium">{team.name}</p>
              {#if team.country}
                <p class="text-sm text-surface-500">{team.country.name}</p>
              {/if}
            </div>
          </button>
        {/each}
      {/if}

      <!-- Cancel button -->
      <button
        type="button"
        class="btn preset-tonal w-full"
        onclick={handleClose}
      >
        {action_cancel()}
      </button>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
