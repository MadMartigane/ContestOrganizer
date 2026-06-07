<script lang="ts">
  interface Props {
    children: import("svelte").Snippet;
    class?: string;
  }

  let { children, class: className = "" }: Props = $props();
</script>

<footer class="flex flex-col gap-2 pt-4 md:flex-row md:flex-wrap md:justify-center [&>*]:w-full md:[&>*]:w-auto {className}">
  {@render children()}
</footer>
