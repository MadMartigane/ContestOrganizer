<script lang="ts">
  import type { MatchGoals } from "$lib/domain/types";
  import {
    match_host_label,
    match_visitor_label,
    scoring_add_remove,
  } from "$lib/paraglide/messages";

  interface Props {
    disabled: boolean;
    goals: MatchGoals;
    onGoalsChange: (goals: MatchGoals) => void;
    scorerType: "common" | "basket" | "rugby";
  }

  let { goals, scorerType, disabled, onGoalsChange }: Props = $props();

  let isAddMode = $state(true);

  function adjustScore(side: "host" | "visitor", delta: number): void {
    if (disabled) {
      return;
    }
    const currentGoals = { ...goals };
    const newHost =
      side === "host" ? currentGoals.host + delta : currentGoals.host;
    const newVisitor =
      side === "visitor" ? currentGoals.visitor + delta : currentGoals.visitor;

    // Score cannot go below 0
    if (newHost < 0 || newVisitor < 0) {
      return;
    }

    onGoalsChange({ host: newHost, visitor: newVisitor });
  }

  function toggleMode(): void {
    isAddMode = !isAddMode;
  }

  function getModeMultiplier(): number {
    return isAddMode ? 1 : -1;
  }

  function getSteps(): number[] {
    if (scorerType === "basket") {
      return [1, 2, 3];
    }
    if (scorerType === "rugby") {
      return [2, 3, 5];
    }
    return [1];
  }

  function getLabelForStep(step: number): string {
    const multiplier = getModeMultiplier();
    const value = step * multiplier;
    if (value > 0) {
      return `+${value}`;
    }
    return String(value);
  }
</script>

<div class="space-y-3">
  <!-- Host row -->
  <div class="flex items-center gap-2">
    <span
      class="text-sm font-medium text-surface-700 dark:text-surface-300 w-20 truncate"
    >
      {match_host_label()}
    </span>
    <div class="flex gap-1">
      {#if scorerType === "common"}
        <button
          type="button"
          class="btn btn-sm preset-tonal"
          disabled={disabled || goals.host <= 0}
          onclick={() => adjustScore("host", -1)}
        >
          −1
        </button>
        <button
          type="button"
          class="btn btn-sm preset-filled"
          {disabled}
          onclick={() => adjustScore("host", 1)}
        >
          +1
        </button>
      {:else}
        {#each getSteps() as step}
          <button
            type="button"
            class="btn btn-sm {isAddMode ? 'preset-filled' : 'preset-tonal'}"
            {disabled}
            onclick={() => adjustScore("host", step * getModeMultiplier())}
          >
            {getLabelForStep(step)}
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Visitor row -->
  <div class="flex items-center gap-2">
    <span
      class="text-sm font-medium text-surface-700 dark:text-surface-300 w-20 truncate"
    >
      {match_visitor_label()}
    </span>
    <div class="flex gap-1">
      {#if scorerType === "common"}
        <button
          type="button"
          class="btn btn-sm preset-tonal"
          disabled={disabled || goals.visitor <= 0}
          onclick={() => adjustScore("visitor", -1)}
        >
          −1
        </button>
        <button
          type="button"
          class="btn btn-sm preset-filled"
          {disabled}
          onclick={() => adjustScore("visitor", 1)}
        >
          +1
        </button>
      {:else}
        {#each getSteps() as step}
          <button
            type="button"
            class="btn btn-sm {isAddMode ? 'preset-filled' : 'preset-tonal'}"
            {disabled}
            onclick={() => adjustScore("visitor", step * getModeMultiplier())}
          >
            {getLabelForStep(step)}
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Toggle for basket/rugby -->
  {#if scorerType !== "common"}
    <div class="flex justify-center">
      <button
        type="button"
        class="btn btn-sm preset-tonal"
        onclick={toggleMode}
      >
        {scoring_add_remove()}
        ({isAddMode ? "+" : "−"})
      </button>
    </div>
  {/if}
</div>
