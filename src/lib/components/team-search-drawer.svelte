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
  let resultsRef = $state<HTMLDivElement | undefined>(undefined);
  let searchInputEl = $state<HTMLInputElement | undefined>(undefined);

  // M13: Autofocus on open
  $effect(() => {
    if (open && searchInputEl) {
      searchInputEl.focus();
    }
  });

  // Svelte 5: capture searchQuery synchronously before the async boundary
  // so $effect tracks it as a dependency. See AGENTS.md "Known Pitfalls".
  $effect(() => {
    const query = searchQuery; // synchronous read = tracked as dependency
    const timer = setTimeout(() => {
      debouncedQuery = query;
    }, 300);
    return () => clearTimeout(timer);
  });

  // Auto-scroll to results when they load
  $effect(() => {
    const data = teamQuery.data; // synchronous read = tracked as dependency
    if (data && data.length > 0 && resultsRef) {
      requestAnimationFrame(() => {
        resultsRef?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });

  const isSearchEnabled = $derived(debouncedQuery.trim().length >= 3);
  const teamQuery = createTeamSearchQuery(sportType, () => debouncedQuery);

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
        bind:this={searchInputEl}
        bind:value={searchQuery}
        placeholder={team_search_placeholder()}
        class="input w-full"
      >

      <!-- Results states -->
      {#if !isSearchEnabled}
        <p class="text-surface-500 text-center">{team_search_placeholder()}</p>
      {:else if teamQuery.isFetching}
        <div class="flex items-center justify-center gap-2 text-surface-500">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <title>Loading</title>
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{team_search_loading()}</span>
        </div>
      {:else if teamQuery.isError && errorType}
        <ApiErrorAlert type={errorType} onRetry={() => teamQuery.refetch()} />
      {:else if teamQuery.isError}
        <ApiErrorAlert type="client" />
      {:else if teamQuery.data && teamQuery.data.length === 0}
        <div class="alert variant-filled-warning">
          <span>😞 {team_search_no_results()}</span>
        </div>
      {:else if teamQuery.data}
        <div bind:this={resultsRef}>
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
              <span class="text-surface-500">→</span>
            </button>
          {/each}
        </div>
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
