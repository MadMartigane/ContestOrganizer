<script lang="ts">
  import Breadcrumb from "$lib/components/breadcrumb.svelte";
  import { config_title, nav_config } from "$lib/paraglide/messages";
</script>

<Breadcrumb items={[{ emoji: "⚙", label: nav_config() }]} />
<h1 class="text-2xl font-bold mt-4">{config_title()}</h1>
<p class="mt-2 text-surface-500">Configuration page — coming in T14.</p>
