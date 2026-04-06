import { describe, expect, it, vi } from "vitest";

// Mock localStorage before importing the component
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length(): number {
    return 0;
  },
  key(): string | null {
    return null;
  },
};
vi.stubGlobal("localStorage", localStorageMock);

// Mock api-sports module
vi.mock("../../modules/api-sports/api-sports", () => ({
  default: {
    searchTeam: vi.fn().mockResolvedValue([]),
  },
}));

// Mock thesportsdb module
vi.mock("../../modules/thesportsdb/thesportsdb.service", () => ({
  default: {
    searchTeams: vi.fn().mockResolvedValue([]),
  },
}));

// Mock Utils module
vi.mock("../../modules/utils/utils", () => ({
  default: {
    debounce: vi.fn((_id: string, fn: () => void) => fn()),
    setFocus: vi.fn(),
    scrollIntoView: vi.fn(),
  },
}));

import "./select-team";

describe("SelectTeam", () => {
  it("should be registered as custom element", () => {
    expect(customElements.get("mad-select-team")).toBeDefined();
  });

  it("should have SelectTeam class registered", () => {
    const SelectTeamClass = customElements.get("mad-select-team");
    expect(SelectTeamClass).toBeInstanceOf(Function);
  });
});
