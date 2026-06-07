<script lang="ts">
  import "../app.css";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import AppLoading from "$lib/components/app-loading.svelte";
  import { queryClient } from "$lib/services/query-client";
  import { initializeSync } from "$lib/services/sync";
  import { initTheme } from "$lib/stores/theme.svelte";

  let { children } = $props();
  let ready = $state(false);

  onMount(async () => {
    initTheme();
    await initializeSync();
    ready = true;
  });
</script>

<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-surface-50-950">
    <main class="container mx-auto p-4 max-w-5xl">
      {#if ready}
        {@render children()}
      {:else}
        <AppLoading />
      {/if}
    </main>
  </div>
</QueryClientProvider>
