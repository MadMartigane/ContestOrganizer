<script lang="ts">
  import { Dialog } from "@skeletonlabs/skeleton-svelte";
  import { dialog_cancel, dialog_confirm } from "$lib/paraglide/messages";

  interface Props {
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    open: boolean;
  }

  let { message, onCancel, onConfirm, open }: Props = $props();
</script>

<Dialog
  closeOnInteractOutside={false}
  {open}
  onOpenChange={(details) => {
    if (!details.open) {
      onCancel();
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
        <span class="text-2xl">🚨</span>
        <Dialog.Title class="text-lg font-bold">{message}</Dialog.Title>
      </div>
      <footer class="flex justify-end gap-2">
        <button
          type="button"
          class="btn btn-lg preset-tonal text-warning-600 dark:text-warning-400"
          onclick={onCancel}
        >
          {dialog_cancel()}
        </button>
        <button
          type="button"
          class="btn btn-lg preset-filled"
          onclick={onConfirm}
        >
          {dialog_confirm()}
        </button>
      </footer>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog>
