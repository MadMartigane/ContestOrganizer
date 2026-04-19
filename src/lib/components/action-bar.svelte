<script lang="ts">
  interface Props {
    children: import("svelte").Snippet;
    class?: string;
  }

  let { children, class: className = "" }: Props = $props();
</script>

<footer class="flex justify-end gap-2 pt-4 {className}">
  {@render children()}
</footer>
