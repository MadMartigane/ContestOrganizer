<script lang="ts">
  import { page } from "$app/stores";
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import {
    nav_home,
    nav_tournament,
    nav_tournaments,
  } from "$lib/paraglide/messages";

  const tournamentId: string = $derived(String($page.params.tournamentId));
</script>

<Breadcrumb
  items={[
		{ emoji: "🏠", label: nav_home(), href: "/home" },
		{ emoji: "🏆", label: nav_tournaments(), href: "/tournaments" },
		{ emoji: "📋", label: nav_tournament() },
	]}
/>
<h1 class="text-2xl font-bold mt-4">{nav_tournament()} #{tournamentId}</h1>
<p class="mt-2 text-surface-500">Tournament detail — coming in T6.</p>
