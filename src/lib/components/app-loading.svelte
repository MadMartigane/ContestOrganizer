<script lang="ts">
  import { app_title } from "$lib/paraglide/messages";
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
  <div
    class="h-10 w-10 animate-spin rounded-full border-4 border-surface-300 border-t-primary-500"
    role="status"
    aria-label="Loading"
  ></div>
  <p class="text-lg font-medium text-surface-500">{app_title()}</p>
</div>
