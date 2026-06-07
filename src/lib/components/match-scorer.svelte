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
  <div class="flex flex-row gap-3">
    {#each [
      { side: 'host' as const, color: 'text-primary-600 dark:text-primary-400' },
      { side: 'visitor' as const, color: 'text-secondary-600 dark:text-secondary-400' }
    ] as col}
      <div class="flex-1 flex flex-col items-center gap-2">
        <span class="text-2xl font-bold {col.color} min-w-[1.5ch]">
          {goals[col.side]}
        </span>
        <div class="flex gap-1 font-bold">
          {#if scorerType === "common"}
            <button
              type="button"
              class="btn btn-lg max-sm:btn-base preset-tonal"
              disabled={disabled || goals[col.side] <= 0}
              onclick={() => adjustScore(col.side, -1)}
            >
              −
            </button>
            <button
              type="button"
              class="btn btn-lg max-sm:btn-base preset-filled"
              {disabled}
              onclick={() => adjustScore(col.side, 1)}
            >
              +
            </button>
          {:else}
            {#each getSteps() as step}
              <button
                type="button"
                class="btn btn-lg max-sm:btn-base {isAddMode ? 'preset-filled' : 'preset-tonal'}"
                {disabled}
                onclick={() => adjustScore(col.side, step * getModeMultiplier())}
              >
                {getLabelForStep(step)}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
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
