<script lang="ts">
  import { Dialog } from "@skeletonlabs/skeleton-svelte";
  import { dialog_close } from "$lib/paraglide/messages";

  interface Props {
    message: string;
    onClose: () => void;
    open: boolean;
  }

  let { message, onClose, open }: Props = $props();
</script>

<Dialog
  closeOnInteractOutside={false}
  {open}
  onOpenChange={(details) => {
    if (!details.open) {
      onClose();
    }
  }}
>
  <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
  <Dialog.Positioner
    class="fixed inset-0 z-50 flex justify-center items-center p-4"
  >
    <Dialog.Content
      class="card bg-surface-100-900 w-full max-w-md p-6 space-y-4 shadow-xl"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <Dialog.Title class="text-lg font-bold">{message}</Dialog.Title>
      </div>
      <footer class="flex justify-end">
        <button type="button" class="btn preset-filled" onclick={onClose}>
          {dialog_close()}
        </button>
      </footer>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
