<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import Toast from "$lib/components/toast.svelte";
  import {
    config_cache_clear,
    config_cache_cleared,
    config_cache_description,
    config_cache_heading,
    config_dark_mode,
    config_title,
    nav_config,
    nav_home,
    nav_tournaments,
  } from "$lib/paraglide/messages";
  import { clearTeamCache } from "$lib/services/team-cache";
  import { getIsDarkMode, toggleDarkMode } from "$lib/stores/theme.svelte";

  let showToast = $state(false);

  function handleClearCache(): void {
    clearTeamCache();
    showToast = true;
  }
</script>

<svelte:head> <title>{config_title()}</title> </svelte:head>

<Breadcrumb items={[{ emoji: "⚙", label: nav_config() }]} />

<h1 class="text-2xl font-bold mt-4">{config_title()}</h1>

<!-- Dark Mode Section -->
<section class="card bg-surface-50-950 p-5 mt-6">
  <Switch checked={getIsDarkMode()} onCheckedChange={() => toggleDarkMode()}>
    <Switch.Control> <Switch.Thumb /> </Switch.Control>
    <Switch.Label>💡 {config_dark_mode()}</Switch.Label>
    <Switch.HiddenInput />
  </Switch>
</section>

<!-- Divider -->
<hr class="border-surface-200-800 my-6">

<!-- Team Cache Section -->
<section class="card bg-surface-50-950 p-5">
  <h2 class="text-lg font-bold">{config_cache_heading()}</h2>
  <p class="text-surface-500 mt-1 text-sm">{config_cache_description()}</p>
  <button
    type="button"
    class="btn btn-lg mt-4 bg-warning-500 text-white hover:bg-warning-600"
    onclick={handleClearCache}
  >
    🗑️ {config_cache_clear()}
  </button>
</section>

<!-- Footer Navigation -->
<div class="flex gap-4 mt-6">
  <a href="/home" class="btn btn-lg preset-filled">🏠 {nav_home()}</a>
  <a href="/tournaments" class="btn btn-lg preset-filled"
    >🏆 {nav_tournaments()}</a
  >
</div>

<!-- Toast -->
<Toast
  message={config_cache_cleared()}
  open={showToast}
  onClose={() => (showToast = false)}
  variant="success"
/>
