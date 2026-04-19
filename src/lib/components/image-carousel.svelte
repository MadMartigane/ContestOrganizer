<script lang="ts">
  import SportIllustration from "$lib/components/sport-illustration.svelte";
  import type { TournamentType } from "$lib/domain/types";

  interface CarouselSlide {
    sport: TournamentType;
  }

  interface Props {
    class?: string;
    interval?: number;
    showDots?: boolean;
    slides: CarouselSlide[];
  }

  let {
    class: className = "",
    interval = 5000,
    showDots = true,
    slides,
  }: Props = $props();

  let currentIndex = $state(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startAutoRotate(): void {
    stopAutoRotate();
    if (slides.length <= 1 || prefersReducedMotion) {
      return;
    }
    timer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
    }, interval);
  }

  function stopAutoRotate(): void {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  $effect(() => {
    startAutoRotate();
    return () => {
      stopAutoRotate();
    };
  });
</script>

{#if slides.length > 0}
  <div class="relative overflow-hidden rounded-xl {className}">
    <!-- Current slide -->
    <div class="transition-opacity duration-500">
      <SportIllustration sport={slides[currentIndex].sport} />
    </div>

    <!-- Pagination dots -->
    {#if showDots && slides.length > 1}
      <div class="flex justify-center gap-2 mt-3">
        {#each slides as _, i}
          <button
            type="button"
            class="w-2 h-2 rounded-full transition-colors {i === currentIndex
              ? 'bg-primary-500'
              : 'bg-surface-300 dark:bg-surface-600'}"
            onclick={() => {
              currentIndex = i;
              startAutoRotate();
            }}
            aria-label="Go to slide {i + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
