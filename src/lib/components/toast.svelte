<script lang="ts">
  import { tick } from "svelte";

  interface Props {
    message: string;
    onClose: () => void;
    open: boolean;
    variant?: "error" | "success" | "warning";
  }

  let { message, onClose, open, variant = "success" }: Props = $props();

  let visible = $state(false);

  $effect(() => {
    if (open) {
      tick().then(() => {
        visible = true;
      });
    } else {
      visible = false;
    }
  });

  // Auto-dismiss after 3 seconds
  $effect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  const variantClasses: Record<string, string> = {
    error: "bg-error-500/90 text-white",
    success: "bg-success-500/90 text-white",
    warning: "bg-warning-500/90 text-white",
  };
</script>

{#if open}
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300
           {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
           {variantClasses[variant] ?? variantClasses.success}
           px-5 py-3 rounded-lg shadow-lg text-sm font-medium"
    role="status"
    aria-live="polite"
  >
    {message}
  </div>
{/if}
