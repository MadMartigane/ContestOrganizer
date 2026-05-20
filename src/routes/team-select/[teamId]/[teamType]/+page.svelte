<script lang="ts">
  import { page } from "$app/stores";

  const teamId: string = $derived(String($page.params.teamId));
  const teamType: string = $derived(String($page.params.teamType));
</script>

<div class="flex flex-col items-center gap-6 mt-6">
  <h1 class="text-2xl font-bold">Team Select</h1>
  <p class="text-surface-500">
    Team selection drawer for slot {teamId} ({teamType}) — coming in T7.
  </p>
</div>
