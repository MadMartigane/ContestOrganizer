<script lang="ts">
  import { page } from "$app/stores";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import {
    nav_home,
    nav_match,
    nav_tournament,
    nav_tournaments,
  } from "$lib/paraglide/messages";

  const tournamentId: string = $derived(String($page.params.tournamentId));
</script>

<Breadcrumb
  items={[
		{ emoji: "🏠", label: nav_home(), href: "/home" },
		{ emoji: "🏆", label: nav_tournaments(), href: "/tournaments" },
		{ emoji: "📋", label: nav_tournament(), href: "/tournament/{tournamentId}" },
		{ emoji: "🎮", label: nav_match() },
	]}
/>
<h1 class="text-2xl font-bold mt-4">
  {nav_match()}
  — {nav_tournament()} #{tournamentId}
</h1>
<p class="mt-2 text-surface-500">Match page — coming in T9.</p>
