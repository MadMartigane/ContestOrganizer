<script lang="ts">
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import ImageCarousel from "$lib/components/image-carousel.svelte";
  import {
    app_title,
    home_config,
    home_tournaments,
    nav_home,
  } from "$lib/paraglide/messages";

  const homeSlides = [
    { sport: "Foot" as const },
    { sport: "Basket" as const },
    { sport: "NBA" as const },
    { sport: "NFL" as const },
    { sport: "Rugby" as const },
  ];
</script>

<svelte:head> <title>{app_title()}</title> </svelte:head>

<Breadcrumb items={[{ emoji: "🏠", label: nav_home() }]} />

<div class="flex flex-col items-center gap-6 mt-6">
  <h1 class="text-3xl font-bold">{app_title()}</h1>

  <div class="w-full max-w-md"><ImageCarousel slides={homeSlides} /></div>

  <span class="text-xs text-surface-500">v{__APP_VERSION__}</span>

  <div class="flex gap-4 w-full max-w-md">
    <a href="/config" class="btn preset-filled flex-1 text-lg py-3">
      ⚙ {home_config()}
    </a>
    <a href="/tournaments" class="btn preset-filled flex-1 text-lg py-3">
      🏆 {home_tournaments()}
    </a>
  </div>
</div>
