<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import { base } from "$app/paths";
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

<div class="flex flex-col items-center gap-6 mt-6">
  <h1 class="text-2xl font-bold">{config_title()}</h1>

  <!-- Dark Mode Section -->
  <section class="card bg-surface-50-950 p-5 w-full max-w-md">
    <Switch checked={getIsDarkMode()} onCheckedChange={() => toggleDarkMode()}>
      <Switch.Control> <Switch.Thumb /> </Switch.Control>
      <Switch.Label>💡 {config_dark_mode()}</Switch.Label>
      <Switch.HiddenInput />
    </Switch>
  </section>

  <!-- Divider -->
  <hr class="border-surface-200-800 w-full max-w-md">

  <!-- Team Cache Section -->
  <section class="card bg-surface-50-950 p-5 w-full max-w-md">
    <h2 class="text-lg font-bold">{config_cache_heading()}</h2>
    <p class="text-surface-500 mt-1 text-sm">{config_cache_description()}</p>
    <button
      type="button"
      class="btn btn-lg mt-4 bg-warning-500 text-white hover:bg-warning-600 w-full"
      onclick={handleClearCache}
    >
      🗑️ {config_cache_clear()}
    </button>
  </section>

  <!-- Footer Navigation -->
  <div class="flex gap-4 w-full max-w-md">
    <a href="{base}/home" class="btn btn-lg preset-filled flex-1 text-lg py-3"
      >🏠 {nav_home()}</a
    >
    <a
      href="{base}/tournaments"
      class="btn btn-lg preset-filled flex-1 text-lg py-3"
      >🏆 {nav_tournaments()}</a
    >
  </div>
</div>

<!-- Toast -->
<Toast
  message={config_cache_cleared()}
  open={showToast}
  onClose={() => (showToast = false)}
  variant="success"
/>
