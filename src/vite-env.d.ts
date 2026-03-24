/// <reference types="vite/client" />

/**
 * JSON modules generated at build time
 */
declare module "@generated/status-data.json" {
  import type { StatusData } from "@core/types/status.js";
  const statusData: StatusData;
  export default statusData;
}

/**
 * Environment variables exposed to the client via import.meta.env
 */
interface ImportMetaEnv {
  /** API key for the API Sports service */
  readonly VITE_API_SPORTS_KEY: string;

  /** Additional environment variables can be added here */
  readonly [key: string]: string | undefined;
}

/**
 * ImportMeta interface extended with Vite-specific properties
 */
interface ImportMeta {
  /** Environment variables exposed to the client */
  readonly env: ImportMetaEnv;

  /** Hot Module Replacement */
  readonly hot?: {
    /** Accept updates for the given module */
    accept(
      dependencies?: string | string[] | ((module: unknown) => void),
      cb?: (module: unknown) => void
    ): void;
    /** Decline updates for the given module */
    decline(): void;
    /** Invalidate the current module */
    invalidate(): void;
    /** Check if HMR is enabled */
    readonly enabled: boolean;
    /** Check if the current connection is stable */
    readonly isLocked: boolean;
    /** Queue a callback to be called after the current HMR update */
    queue(cb: () => void): void;
    /** Remove a callback from the HMR queue */
    removeQueue(cb: () => void): void;
  };
}
