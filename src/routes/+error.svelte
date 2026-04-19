<script lang="ts">
  import { page } from "$app/stores";
  import ImageCarousel from "$lib/components/image-carousel.svelte";
  import {
    error_404_title,
    nav_home,
    nav_tournaments,
  } from "$lib/paraglide/messages";

  const status: number = $derived($page.status);
  const message: string | undefined = $derived($page.error?.message);

  const errorSlides = [
    { sport: "Foot" as const },
    { sport: "Basket" as const },
  ];
</script>

<svelte:head> <title>404</title> </svelte:head>

<div class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
  <!-- Decorative 4-0-4 circles -->
  <div class="flex items-center gap-3">
    <span
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-bold text-lg"
      >4</span
    >
    <span
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-bold text-lg"
      >0</span
    >
    <span
      class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-bold text-lg"
      >4</span
    >
  </div>

  <h1 class="text-xl font-bold text-surface-700 dark:text-surface-300">
    {error_404_title()}
  </h1>

  {#if message && status !== 404}
    <p class="text-surface-500">{message}</p>
  {/if}

  <!-- Image carousel with pagination dots -->
  <div class="w-full max-w-sm">
    <ImageCarousel slides={errorSlides} showDots={true} />
  </div>

  <!-- Navigation buttons -->
  <div class="flex gap-4 mt-4">
    <a href="/home" class="btn preset-filled">🏠 {nav_home()}</a>
    <a href="/tournaments" class="btn preset-filled">🏆 {nav_tournaments()}</a>
  </div>
</div>
