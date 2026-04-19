<script lang="ts">
  import "../app.css";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import { queryClient } from "$lib/services/query-client";
  import { initTheme } from "$lib/stores/theme.svelte";

  let { children } = $props();

  onMount(() => {
    initTheme();
  });
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-surface-50-950">
    <main class="container mx-auto p-4 max-w-5xl">{@render children()}</main>
  </div>
</QueryClientProvider>
