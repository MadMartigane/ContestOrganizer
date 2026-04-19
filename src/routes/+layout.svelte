<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { initTheme } from "$lib/stores/theme.svelte";

  let { children } = $props();

  onMount(() => {
    initTheme();
  });
</script>

<div class="min-h-screen bg-surface-50-950">
  <main class="container mx-auto p-4 max-w-5xl">{@render children()}</main>
</div>
