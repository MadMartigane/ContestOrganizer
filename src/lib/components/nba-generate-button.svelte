<script lang="ts">
  import type { Match, TeamRow, TournamentType } from "$lib/domain/types";
  import {
    nba_generate,
    nba_generate_confirm,
    nba_validation_exceeds_max,
    nba_validation_min_teams,
    nba_validation_no_remaining,
  } from "$lib/paraglide/messages";
  import {
    computeNbaMissingMatches,
    generateNbaSchedule,
    type NbaValidationWarning,
    validateNbaGeneration,
  } from "$lib/utils/nba-schedule";
  import AlertDialog from "./alert-dialog.svelte";
  import ConfirmDialog from "./confirm-dialog.svelte";

  interface Props {
    grid: TeamRow[];
    matchs: Match[];
    onGenerate: (newMatches: Match[]) => void;
    seasonComplete: boolean;
    sportType: TournamentType;
  }

  let { grid, matchs, onGenerate, seasonComplete, sportType }: Props = $props();

  let confirmOpen = $state(false);
  let alertOpen = $state(false);
  let alertDialogMessage = $state("");

  const isNba = $derived(sportType === "NBA");
  const missingCount = $derived(computeNbaMissingMatches(grid, matchs));

  function translateWarning(warning: NbaValidationWarning): string {
    if (warning.message.includes("assigned teams are required")) {
      return nba_validation_min_teams();
    }

    if (warning.message.includes("exceeded the maximum")) {
      const name = warning.teamName ?? "Unknown";
      return nba_validation_exceeds_max({ name, count: 82 });
    }

    if (warning.message.includes("remaining games")) {
      return nba_validation_no_remaining();
    }

    return warning.message;
  }

  function handleClick(): void {
    const warnings = validateNbaGeneration(grid, matchs);

    if (warnings.length > 0) {
      const translated = warnings.map(translateWarning);
      alertDialogMessage = translated.join("\n");
      alertOpen = true;
      return;
    }

    confirmOpen = true;
  }

  function handleConfirm(): void {
    confirmOpen = false;
    const newMatches = generateNbaSchedule(grid, matchs);
    onGenerate(newMatches);
  }

  function handleConfirmCancel(): void {
    confirmOpen = false;
  }

  function handleAlertClose(): void {
    alertOpen = false;
    alertDialogMessage = "";
  }
</script>

{#if isNba && !seasonComplete}
  <button
    class="btn preset-filled"
    disabled={missingCount === 0}
    type="button"
    onclick={handleClick}
  >
    <span>🏀</span>
    <span>{nba_generate({ count: missingCount })}</span>
  </button>
{/if}

<ConfirmDialog
  message={nba_generate_confirm({ count: missingCount })}
  onConfirm={handleConfirm}
  onCancel={handleConfirmCancel}
  open={confirmOpen}
/>

<AlertDialog
  message={alertDialogMessage}
  onClose={handleAlertClose}
  open={alertOpen}
/>
