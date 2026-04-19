<script lang="ts">
  import { page } from "$app/stores";

  const teamId: string = $derived(String($page.params.teamId));
  const teamType: string = $derived(String($page.params.teamType));
</script>

<h1 class="text-2xl font-bold mt-4">Team Select</h1>
<p class="mt-2 text-surface-500">
  Team selection drawer for slot {teamId} ({teamType}) — coming in T7.
</p>
