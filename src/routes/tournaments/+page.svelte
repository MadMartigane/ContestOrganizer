<script lang="ts">
  import { onMount } from "svelte";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import NewTournamentForm from "$lib/components/new-tournament-form.svelte";
  import TournamentListItem from "$lib/components/tournament-list-item.svelte";
  import TournamentsEmptyState from "$lib/components/tournaments-empty-state.svelte";
  import type { Tournament, TournamentType } from "$lib/domain/types";
  import {
    nav_home,
    nav_tournaments,
    tournament_new,
  } from "$lib/paraglide/messages";
  import {
    createTournament,
    deleteTournament,
    getAllTournaments,
  } from "$lib/services/storage";

  let tournaments = $state<Tournament[]>([]);
  let showForm = $state(false);

  onMount(() => {
    tournaments = getAllTournaments();
  });

  function handleAdd(name: string, type: TournamentType): void {
    createTournament(name, type);
    tournaments = getAllTournaments();
    showForm = false;
  }

  function handleDelete(id: string): void {
    deleteTournament(id);
    tournaments = getAllTournaments();
  }

  function handleCancel(): void {
    showForm = false;
  }
</script>

<svelte:head> <title>{nav_tournaments()}</title> </svelte:head>

<Breadcrumb
  items={[
    { emoji: "🏠", label: nav_home(), href: "/home" },
    { emoji: "🏆", label: nav_tournaments() },
  ]}
/>

<div class="flex flex-col items-center gap-6 mt-6">
  <h1 class="text-2xl font-bold">{nav_tournaments()}</h1>

  {#if tournaments.length === 0 && !showForm}
    <TournamentsEmptyState />
  {:else}
    <div class="flex flex-col gap-2 w-full max-w-md">
      {#each tournaments as tournament (tournament.id)}
        <TournamentListItem {tournament} onDelete={handleDelete} />
      {/each}
    </div>
  {/if}

  <hr class="hr w-full max-w-md">

  <div class="w-full max-w-md">
    {#if showForm}
      <NewTournamentForm onAdd={handleAdd} onCancel={handleCancel} />
    {:else}
      <button
        type="button"
        class="btn btn-lg preset-filled w-full"
        onclick={() => (showForm = true)}
      >
        ➕ {tournament_new()}
      </button>
    {/if}
  </div>
</div>
