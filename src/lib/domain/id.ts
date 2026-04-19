/**
 * Generates a unique identifier using the Web Crypto API.
 * Uses crypto.randomUUID() for standard UUID v4 generation.
 */
export const generateId = (): string => crypto.randomUUID();
