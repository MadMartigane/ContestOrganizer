<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import type { MatchGoals } from "$lib/domain/types";
  import { scoring_add_remove } from "$lib/paraglide/messages";

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

  function getModeMultiplier(): number {
    return isAddMode ? 1 : -1;
  }

  function getSteps(): number[] {
    if (scorerType === "basket") {
      return [1, 2, 3];
    }
    if (scorerType === "rugby") {
      return [3, 5, 7];
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

<div class="space-y-2">
  <!-- Inline score line: [host buttons] [host score] - [visitor score] [visitor buttons] -->
  <div class="flex flex-wrap items-center justify-center gap-2 max-sm:gap-1 max-sm:text-lg font-bold">
    <!-- Host buttons -->
    <div class="flex gap-1">
      {#if scorerType === "common"}
        <button
          type="button"
          class="btn btn-lg preset-tonal"
          disabled={disabled || goals.host <= 0}
          onclick={() => adjustScore("host", -1)}
        >
          −
        </button>
        <button
          type="button"
          class="btn btn-lg preset-filled"
          {disabled}
          onclick={() => adjustScore("host", 1)}
        >
          +
        </button>
      {:else}
        {#each getSteps() as step}
          <button
            type="button"
            class="btn btn-lg {isAddMode ? 'preset-filled' : 'preset-tonal'}"
            {disabled}
            onclick={() => adjustScore("host", step * getModeMultiplier())}
          >
            {getLabelForStep(step)}
          </button>
        {/each}
      {/if}
    </div>

    <!-- Score display (kept as one unit to prevent wrapping inside) -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Host score -->
      <span
        class="text-primary-600 dark:text-primary-400 min-w-[1.5ch] text-center"
      >
        {goals.host}
      </span>

      <!-- Separator -->
      <span class="text-surface-500">-</span>

      <!-- Visitor score -->
      <span
        class="text-secondary-600 dark:text-secondary-400 min-w-[1.5ch] text-center"
      >
        {goals.visitor}
      </span>
    </div>

    <!-- Visitor buttons -->
    <div class="flex gap-1">
      {#if scorerType === "common"}
        <button
          type="button"
          class="btn btn-lg preset-tonal"
          disabled={disabled || goals.visitor <= 0}
          onclick={() => adjustScore("visitor", -1)}
        >
          −
        </button>
        <button
          type="button"
          class="btn btn-lg preset-filled"
          {disabled}
          onclick={() => adjustScore("visitor", 1)}
        >
          +
        </button>
      {:else}
        {#each getSteps() as step}
          <button
            type="button"
            class="btn btn-lg {isAddMode ? 'preset-filled' : 'preset-tonal'}"
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
      <Switch
        checked={isAddMode}
        onCheckedChange={(e) => (isAddMode = e.checked)}
      >
        <Switch.Control><Switch.Thumb /></Switch.Control>
        <Switch.Label>
          {scoring_add_remove()}
          ({isAddMode ? "+" : "−"})
        </Switch.Label>
        <Switch.HiddenInput />
      </Switch>
    </div>
  {/if}
</div>
