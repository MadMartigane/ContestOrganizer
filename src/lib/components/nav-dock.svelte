<script lang="ts">
  import {
    nav_scroll_bottom,
    nav_scroll_current,
    nav_scroll_top,
  } from "$lib/paraglide/messages";

  interface Props {
    hasTargetMatch: boolean;
    onScrollToBottom: () => void;
    onScrollToCurrentMatch: () => void;
    onScrollToTop: () => void;
    visible: boolean;
  }

  let {
    hasTargetMatch,
    onScrollToTop,
    onScrollToCurrentMatch,
    onScrollToBottom,
    visible,
  }: Props = $props();

  function handleKeyDown(event: KeyboardEvent): void {
    if (!visible) {
      return;
    }
    if (event.altKey && event.key === "t") {
      event.preventDefault();
      onScrollToTop();
    } else if (event.altKey && event.key === "m") {
      event.preventDefault();
      if (hasTargetMatch) {
        onScrollToCurrentMatch();
      }
    } else if (event.altKey && event.key === "b") {
      event.preventDefault();
      onScrollToBottom();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if visible}
  <div
    class="fixed bottom-4 right-4 z-40 flex flex-col gap-2"
    role="navigation"
    aria-label="Match navigation"
  >
    <button
      type="button"
      class="btn preset-tonal shadow-lg"
      onclick={onScrollToTop}
      title="{nav_scroll_top()} (Alt+T)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5"
      >
        <title>Top</title>
        <path d="M12 4l-8 8h5v8h6v-8h5z" />
      </svg>
    </button>
    <button
      type="button"
      class="btn preset-tonal shadow-lg"
      disabled={!hasTargetMatch}
      onclick={onScrollToCurrentMatch}
      title="{nav_scroll_current()} (Alt+M)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5"
      >
        <title>Current</title>
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
    </button>
    <button
      type="button"
      class="btn preset-tonal shadow-lg"
      onclick={onScrollToBottom}
      title="{nav_scroll_bottom()} (Alt+B)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-5 h-5"
      >
        <title>Bottom</title>
        <path d="M12 20l8-8h-5V4h-6v8H4z" />
      </svg>
    </button>
  </div>
{/if}
