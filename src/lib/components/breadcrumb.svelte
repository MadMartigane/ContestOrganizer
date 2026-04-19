<script lang="ts">
  import type { BreadcrumbItem } from "$lib/domain/types";

  interface Props {
    items: BreadcrumbItem[];
  }

  let { items }: Props = $props();
</script>

<nav
  aria-label="Breadcrumb"
  class="flex items-center gap-1 py-2 text-sm flex-wrap"
>
  {#each items as item, i}
    {#if i > 0}
      <span class="text-surface-500 mx-1">›</span>
    {/if}
    {#if item.href}
      <a
        href={item.href}
        class="flex items-center gap-1 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
      >
        <span aria-hidden="true">{item.emoji}</span>
        <span>{item.label}</span>
      </a>
    {:else}
      <span
        class="flex items-center gap-1 font-semibold text-surface-900 dark:text-surface-100"
      >
        <span aria-hidden="true">{item.emoji}</span>
        <span>{item.label}</span>
      </span>
    {/if}
  {/each}
</nav>
