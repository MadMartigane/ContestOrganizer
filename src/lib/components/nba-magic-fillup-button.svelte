<script lang="ts">
  import type { TeamRow, TournamentType } from "$lib/domain/types";
  import {
    action_magic_fillup,
    magic_fillup_error,
  } from "$lib/paraglide/messages";
  import { magicFillUp, resolveNbaTeams } from "$lib/utils/magic-fillup";
  import AlertDialog from "./alert-dialog.svelte";

  interface Props {
    grid: TeamRow[];
    onFill: (newGrid: TeamRow[]) => void;
    sportType: TournamentType;
  }

  let { grid, onFill, sportType }: Props = $props();

  let loading = $state(false);
  let alertOpen = $state(false);

  const isNba = $derived(sportType === "NBA");
  const assignedCount = $derived(
    grid.filter((s) => s.team !== undefined).length
  );
  const disabled = $derived(assignedCount >= 30);

  async function handleClick(): Promise<void> {
    loading = true;
    try {
      const teams = await resolveNbaTeams();
      const newGrid = magicFillUp(grid, teams, sportType);
      onFill(newGrid);
    } catch {
      alertOpen = true;
    } finally {
      loading = false;
    }
  }

  function handleAlertClose(): void {
    alertOpen = false;
  }
</script>

{#if isNba}
  <button
    class="btn btn-lg preset-filled"
    disabled={disabled || loading}
    type="button"
    onclick={handleClick}
  >
    {#if loading}
      <span class="animate-spin">⏳</span>
    {/if}
    <span>{action_magic_fillup()}</span>
  </button>
{/if}

<AlertDialog
  message={magic_fillup_error()}
  onClose={handleAlertClose}
  open={alertOpen}
/>
