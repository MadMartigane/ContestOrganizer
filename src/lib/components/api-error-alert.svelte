<script lang="ts">
  import {
    action_retry,
    api_error_client_message,
    api_error_client_title,
    api_error_network_message,
    api_error_network_title,
    api_error_not_found_message,
    api_error_not_found_title,
    api_error_rate_limit_message,
    api_error_rate_limit_title,
    api_error_server_message,
    api_error_server_title,
  } from "$lib/paraglide/messages";
  import type { ApiErrorType } from "$lib/services/team-search";

  interface Props {
    onRetry?: () => void;
    type: ApiErrorType;
  }

  let { onRetry, type }: Props = $props();

  const RETRYABLE: ReadonlySet<ApiErrorType> = new Set([
    "network",
    "rate_limit",
    "server",
  ]);

  const TITLE_MAP: Record<ApiErrorType, () => string> = {
    network: api_error_network_title,
    rate_limit: api_error_rate_limit_title,
    not_found: api_error_not_found_title,
    server: api_error_server_title,
    client: api_error_client_title,
  };

  const MESSAGE_MAP: Record<ApiErrorType, () => string> = {
    network: api_error_network_message,
    rate_limit: api_error_rate_limit_message,
    not_found: api_error_not_found_message,
    server: api_error_server_message,
    client: api_error_client_message,
  };

  const isRetryable = $derived(RETRYABLE.has(type));
</script>

<div
  class="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-400"
  role="alert"
>
  <span class="text-xl leading-none shrink-0" aria-hidden="true">⚠️</span>
  <div class="flex-1 space-y-1">
    <p class="font-bold">{TITLE_MAP[type]()}</p>
    <p class="text-sm">{MESSAGE_MAP[type]()}</p>
    {#if isRetryable && onRetry}
      <button
        type="button"
        class="btn btn-lg preset-tonal mt-2 inline-flex items-center gap-1.5 text-sm"
        onclick={onRetry}
      >
        <span aria-hidden="true">🔄</span>
        {action_retry()}
      </button>
    {/if}
  </div>
</div>
