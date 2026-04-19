<script lang="ts">
  import type { GenericTeam } from "$lib/domain/types";

  interface Props {
    rank?: number;
    team: GenericTeam | undefined;
    variant?: "normal" | "reverse";
  }

  let { rank, team, variant = "normal" }: Props = $props();

  // Lazy loading state
  let isVisible = $state(false);
  let logoLoaded = $state(false);
  let logoError = $state(false);
  let containerEl = $state<HTMLElement | undefined>(undefined);

  // Rank badge gradient classes
  function getRankBadgeClass(r: number | undefined): string {
    if (r === 1) {
      return "bg-gradient-to-br from-yellow-400 to-yellow-700 border-yellow-300";
    }
    if (r === 2) {
      return "bg-gradient-to-br from-gray-200 to-gray-500 border-white";
    }
    if (r === 3) {
      return "bg-gradient-to-br from-amber-600 to-amber-900 border-yellow-600";
    }
    return "bg-gradient-to-br from-blue-100 to-blue-400 border-white";
  }

  const rankBadgeClass = $derived(getRankBadgeClass(rank));

  // IntersectionObserver for lazy loading
  $effect(() => {
    if (!team?.logo || isVisible) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerEl) {
      observer.observe(containerEl);
    }
    return () => observer.disconnect();
  });

  // prefers-reduced-motion check
  const prefersReducedMotion =
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
</script>

{#if team !== undefined}
  <div
    bind:this={containerEl}
    class="flex items-center gap-3 p-3 rounded-lg bg-surface-50-950 hover:bg-surface-100-900 transition-colors {variant === 'reverse' ? 'flex-row-reverse' : ''}"
  >
    <!-- Rank badge -->
    {#if rank !== undefined}
      <div
        class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white border {rankBadgeClass}"
      >
        {rank}
      </div>
    {/if}

    <!-- Logo area -->
    <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center">
      {#if isVisible}
        {#if logoError}
          <!-- Error state: shield-X icon -->
          <svg
            class="w-12 h-12 text-error-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <title>Error</title>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        {:else if logoLoaded}
          <!-- Loaded state: actual image -->
          <img src={team.logo} alt={team.name} class="w-12 h-12 object-contain">
        {:else}
          <!-- Loading state: animated SVG placeholder -->
          <svg
            class="w-10 h-10 {prefersReducedMotion ? '' : 'animate-pulse'}"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Loading placeholder</title>
            <circle
              cx="20"
              cy="20"
              r="18"
              class="fill-surface-200 dark:fill-surface-700"
            />
            <circle
              cx="20"
              cy="20"
              r="10"
              class="fill-surface-300 dark:fill-surface-600"
            />
          </svg>

          <!-- Hidden image preloader -->
          <img
            src={team.logo}
            alt=""
            class="hidden"
            onload={() => { logoLoaded = true; }}
            onerror={() => { logoError = true; }}
          >
        {/if}
      {:else}
        <!-- Not yet in viewport: animated SVG placeholder -->
        <svg
          class="w-10 h-10 {prefersReducedMotion ? '' : 'animate-pulse'}"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Loading placeholder</title>
          <circle
            cx="20"
            cy="20"
            r="18"
            class="fill-surface-200 dark:fill-surface-700"
          />
          <circle
            cx="20"
            cy="20"
            r="10"
            class="fill-surface-300 dark:fill-surface-600"
          />
        </svg>
      {/if}
    </div>

    <!-- Team name -->
    <span class="font-medium text-surface-700 dark:text-surface-300 truncate">
      {team.name}
    </span>
  </div>
{:else}
  <!-- No team state -->
  <div
    class="flex items-center gap-3 p-3 rounded-lg bg-surface-50-950 opacity-60"
  >
    <span class="text-3xl">⏳</span>
    <span class="text-surface-500 text-sm">—</span>
  </div>
{/if}
