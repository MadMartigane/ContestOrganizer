<script lang="ts">
  import { base } from "$app/paths";
  import { error_go_home, error_heading } from "$lib/paraglide/messages";

  interface Props {
    description: string;
    showHomeButton?: boolean;
  }

  let { description, showHomeButton = true }: Props = $props();
</script>

<div
  class="flex flex-col items-center justify-center gap-4 p-6 text-center text-error-700 dark:text-error-400"
>
  <span class="text-4xl">🐛</span>
  <h2 class="text-xl font-bold">{error_heading()}</h2>
  <p class="font-bold">{description}</p>
  {#if showHomeButton}
    <a href="{base}/home" class="btn btn-lg preset-filled mt-2"
      >🏠 {error_go_home()}</a
    >
  {/if}
</div>
