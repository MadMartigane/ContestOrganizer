<script lang="ts">
  import { tournaments_empty } from "$lib/paraglide/messages";
</script>

<div class="flex flex-col items-center justify-center gap-3 py-12">
  <span class="text-5xl text-warning-500">🏆</span>
  <p class="text-lg text-surface-600 dark:text-surface-400">
    {tournaments_empty()}
  </p>
  <span class="text-4xl text-success-500">⛹</span>
</div>
