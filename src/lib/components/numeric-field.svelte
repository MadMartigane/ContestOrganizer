<script lang="ts">
  interface Props {
    label: string;
    max?: number;
    min?: number;
    onchange: (value: number) => void;
    placeholder?: string;
    readonly?: boolean;
    step?: number;
    value: number;
  }

  let {
    label,
    max = 100,
    min = 0,
    onchange,
    readonly = false,
    placeholder = "",
    step = 1,
    value = $bindable(),
  }: Props = $props();

  let previousValid: number = $state(value);

  function clamp(v: number): number {
    return Math.max(min, Math.min(max, v));
  }

  function increment(): void {
    const next = clamp(value + step);
    value = next;
    previousValid = next;
    onchange(next);
  }

  function decrement(): void {
    const next = clamp(value - step);
    value = next;
    previousValid = next;
    onchange(next);
  }

  function handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    const parsed = Number(target.value);
    if (Number.isNaN(parsed)) {
      value = previousValid;
      return;
    }
    const clamped = clamp(parsed);
    value = clamped;
    previousValid = clamped;
    onchange(clamped);
  }

  function handleBlur(): void {
    const clamped = clamp(value);
    value = clamped;
    previousValid = clamped;
    onchange(clamped);
  }
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm font-medium text-surface-700 dark:text-surface-300"
    >{label}</label
  >
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="btn btn-sm preset-tonal"
      onclick={decrement}
      disabled={readonly || value <= min}
      aria-label="Decrement"
    >
      −
    </button>
    <input
      type="number"
      {min}
      {max}
      {step}
      {readonly}
      {placeholder}
      bind:value
      oninput={handleInput}
      onblur={handleBlur}
      class="input w-16 text-center"
    >
    <button
      type="button"
      class="btn btn-sm preset-tonal"
      onclick={increment}
      disabled={readonly || value >= max}
      aria-label="Increment"
    >
      +
    </button>
  </div>
</div>
