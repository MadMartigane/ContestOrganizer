import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Must import AFTER mocking fetch — use dynamic import
describe("fetchBackendCollection", () => {
  let fetchBackendCollection: typeof import("$lib/services/backend-api").fetchBackendCollection;

  beforeAll(async () => {
    const mod = await import("$lib/services/backend-api");
    fetchBackendCollection = mod.fetchBackendCollection;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed collection on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          procedure: "OK",
          data: { timestamp: 123, tournaments: [] },
        }),
    });
    const result = await fetchBackendCollection();
    expect(result).toEqual({ timestamp: 123, tournaments: [] });
  });

  it("returns null on procedure ERROR", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          procedure: "ERROR",
          error: "Something went wrong",
        }),
    });
    const result = await fetchBackendCollection();
    expect(result).toBeNull();
  });

  it("returns null on HTTP error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });
    const result = await fetchBackendCollection();
    expect(result).toBeNull();
  });

  it("returns null on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await fetchBackendCollection();
    expect(result).toBeNull();
  });

  it("returns null on malformed response data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          procedure: "OK",
          data: { invalid: true },
        }),
    });
    const result = await fetchBackendCollection();
    expect(result).toBeNull();
  });
});

describe("saveToBackend", () => {
  let saveToBackend: typeof import("$lib/services/backend-api").saveToBackend;

  beforeAll(async () => {
    const mod = await import("$lib/services/backend-api");
    saveToBackend = mod.saveToBackend;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("fires POST request and does not throw", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ procedure: "OK" }),
    });
    expect(() =>
      saveToBackend({ timestamp: 1, tournaments: [] })
    ).not.toThrow();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/index.php/store/tournaments",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does not throw on fetch failure", () => {
    mockFetch.mockRejectedValue(new Error("fail"));
    expect(() =>
      saveToBackend({ timestamp: 1, tournaments: [] })
    ).not.toThrow();
  });
});
