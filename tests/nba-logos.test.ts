import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { asset, base } from "$app/paths";
import {
  NBA_LOGO_FILES,
  NBA_TEAMS,
  resolveTeamLogo,
} from "$lib/domain/nba-teams";
import { loadCollection } from "$lib/services/storage";
import {
  getCachedNbaAllTeams,
  getCachedTeams,
  getStaleNbaAllTeams,
} from "$lib/services/team-cache";

const DEAD_KNICKS_URL =
  "https://www.thesportsdb.com/images/media/team/badge/4k8obt1778226764.png";
const STORAGE_KEY_TOURNAMENTS = "CONTEST_ORGANIZER_TOURNAMENTS";
const CACHE_KEY = "CONTEST_ORGANIZER_TEAM_CACHE_V2";

const installLocalStorage = (): Map<string, string> => {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
    removeItem(key: string): void {
      store.delete(key);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
  return store;
};

const emptyGridRow = (
  id: string,
  type: "NBA" | "Foot",
  team:
    | {
        id: number;
        type: "NBA" | "Foot";
        name: string;
        logo: string;
      }
    | undefined
) => ({
  id,
  type,
  points: 0,
  scoredGoals: 0,
  concededGoals: 0,
  goalAverage: 0,
  scheduledMatchs: 0,
  team,
});

describe("NBA logo pack", () => {
  it("maps ids 1-30 to existing SVG files without remote hosts", () => {
    const keys = Object.keys(NBA_LOGO_FILES).sort(
      (a, b) => Number(a) - Number(b)
    );
    expect(keys).toEqual(
      Array.from({ length: 30 }, (_, index) => String(index + 1))
    );

    for (const path of Object.values(NBA_LOGO_FILES)) {
      const filePath = `static${path}`;
      const contents = readFileSync(filePath, "utf8");
      expect(contents).toContain("<svg");
      expect(contents).not.toContain("thesportsdb");
      expect(contents).not.toContain("<html");
    }
  });

  it("keeps NBA_TEAMS logos on local paths for the 30 franchises", () => {
    expect(NBA_TEAMS).toHaveLength(30);
    expect(NBA_TEAMS.find((team) => team.id === 1)?.name).toBe(
      "Boston Celtics"
    );
    expect(NBA_TEAMS.find((team) => team.id === 3)?.name).toBe(
      "New York Knicks"
    );
    expect(NBA_TEAMS.find((team) => team.id === 30)?.name).toBe(
      "San Antonio Spurs"
    );

    for (const team of NBA_TEAMS) {
      expect(team.logo).toBe(NBA_LOGO_FILES[team.id]);
      expect(team.logo).not.toContain("thesportsdb");
    }
  });
});

describe("resolveTeamLogo", () => {
  it("prefers local asset paths for known NBA ids", () => {
    const knicks = {
      id: 3,
      type: "NBA" as const,
      name: "New York Knicks",
      logo: DEAD_KNICKS_URL,
    };
    const resolved = resolveTeamLogo(knicks);
    expect(resolved).toBe(asset("/nba-logos/nyk.svg"));
    expect(resolved).not.toContain("thesportsdb");
    expect(asset("/nba-logos/bos.svg")).toBe(`${base}/nba-logos/bos.svg`);
  });

  it("returns stored logos for non-NBA or unmapped ids", () => {
    expect(
      resolveTeamLogo({
        id: 3,
        type: "Foot",
        logo: DEAD_KNICKS_URL,
      })
    ).toBe(DEAD_KNICKS_URL);

    expect(
      resolveTeamLogo({
        id: 99,
        type: "NBA",
        logo: "https://example.invalid/old.png",
      })
    ).toBe("https://example.invalid/old.png");
  });

  it("resolves every NBA_TEAMS entry through asset", () => {
    for (const entry of NBA_TEAMS) {
      expect(resolveTeamLogo(entry)).toBe(asset(NBA_LOGO_FILES[entry.id]));
    }
  });
});

describe("loadCollection NBA logo rewrite", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("rewrites known NBA logos and leaves others unchanged", () => {
    const knicksTeam = {
      id: 3,
      type: "NBA" as const,
      name: "New York Knicks",
      logo: DEAD_KNICKS_URL,
    };
    const customNbaTeam = {
      id: 999_999,
      type: "NBA" as const,
      name: "Custom",
      logo: "https://example.invalid/old.png",
    };
    const footTeam = {
      id: 33,
      type: "Foot" as const,
      name: "Paris",
      logo: "https://example.invalid/foot.png",
    };
    const now = Date.now();

    localStorage.setItem(
      STORAGE_KEY_TOURNAMENTS,
      JSON.stringify({
        timestamp: now,
        tournaments: [
          {
            id: "nba-1",
            name: "NBA Test",
            type: "NBA",
            matchs: [],
            timestamp: now,
            grid: [
              emptyGridRow("row-knicks", "NBA", knicksTeam),
              emptyGridRow("row-custom", "NBA", customNbaTeam),
            ],
          },
          {
            id: "foot-1",
            name: "Foot Test",
            type: "Foot",
            matchs: [],
            timestamp: now,
            grid: [emptyGridRow("row-foot", "Foot", footTeam)],
          },
        ],
      })
    );

    const collection = loadCollection();
    const nbaTournament = collection.tournaments.find(
      (tournament) => tournament.id === "nba-1"
    );
    const footTournament = collection.tournaments.find(
      (tournament) => tournament.id === "foot-1"
    );

    expect(nbaTournament?.grid[0]?.team?.logo).toBe(
      resolveTeamLogo(knicksTeam)
    );
    expect(nbaTournament?.grid[1]?.team?.logo).toBe(
      "https://example.invalid/old.png"
    );
    expect(footTournament?.grid[0]?.team?.logo).toBe(
      "https://example.invalid/foot.png"
    );
  });
});

describe("team-cache NBA logo heal on read", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("heals NBA logos on read without rewriting localStorage", () => {
    const knicksTeam = {
      id: 3,
      type: "NBA" as const,
      name: "New York Knicks",
      logo: DEAD_KNICKS_URL,
    };
    const now = Date.now();

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        entries: {
          "Foot:paris": {
            query: "paris",
            sportType: "Foot",
            teams: [
              {
                id: 33,
                type: "Foot",
                name: "Paris",
                logo: "https://example.invalid/foot.png",
              },
            ],
            timestamp: now,
          },
        },
        nbaAllTeams: [knicksTeam],
        nbaAllTeamsTimestamp: now,
      })
    );

    const resolvedKnicksLogo = resolveTeamLogo(knicksTeam);

    expect(getCachedNbaAllTeams()?.[0]?.logo).toBe(resolvedKnicksLogo);
    expect(getStaleNbaAllTeams()?.[0]?.logo).toBe(resolvedKnicksLogo);
    expect(getCachedTeams("NBA", "knicks")?.[0]?.logo).toBe(resolvedKnicksLogo);
    expect(getCachedTeams("Foot", "paris")?.[0]?.logo).toBe(
      "https://example.invalid/foot.png"
    );

    const stored = JSON.parse(localStorage.getItem(CACHE_KEY) as string) as {
      nbaAllTeams: Array<{ logo: string }>;
    };
    expect(stored.nbaAllTeams[0].logo).toBe(DEAD_KNICKS_URL);
  });
});
