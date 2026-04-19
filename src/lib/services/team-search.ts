import type { GenericTeam, TournamentType } from "$lib/domain/types";

// ──────────────────────────────────────────────────
// API Configuration
// ──────────────────────────────────────────────────

const API_SPORTS_BASE_URLS: Record<string, string> = {
  Foot: "https://v3.football.api-sports.io",
  Basket: "https://v1.basketball.api-sports.io",
  NFL: "https://v1.americanfootball.api-sports.io",
  Rugby: "https://v1.rugby.api-sports.io",
};

const THESPORTSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";
const NBA_LEAGUE_ID = "4387";

// ──────────────────────────────────────────────────
// Error Types
// ──────────────────────────────────────────────────

export type ApiErrorType =
  | "client"
  | "network"
  | "not_found"
  | "rate_limit"
  | "server";

export class TeamSearchError extends Error {
  readonly type: ApiErrorType;
  readonly statusCode?: number;

  constructor(message: string, type: ApiErrorType, statusCode?: number) {
    super(message);
    this.name = "TeamSearchError";
    this.type = type;
    this.statusCode = statusCode;
  }
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/** Search teams by name and sport type. */
export const searchTeams = (
  sportType: TournamentType,
  query: string
): Promise<GenericTeam[]> => {
  if (sportType === "NBA") {
    return searchNbaTeams(query);
  }
  return searchApiSportsTeams(sportType, query);
};

/** Fetch all NBA teams (used for search and magic fill-up). */
export const fetchAllNbaTeams = async (): Promise<GenericTeam[]> => {
  const url = `${THESPORTSDB_BASE_URL}/lookup_all_teams.php?id=${NBA_LEAGUE_ID}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new TeamSearchError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "network"
    );
  }

  if (!response.ok) {
    throw classifyHttpError(response.status, response.statusText);
  }

  const data = await response.json();
  if (!data.teams) {
    return [];
  }
  return mapTheSportsDbResponse(data.teams);
};

// ──────────────────────────────────────────────────
// Internal: API-Sports Search
// ──────────────────────────────────────────────────

const searchApiSportsTeams = async (
  sportType: TournamentType,
  query: string
): Promise<GenericTeam[]> => {
  const baseUrl = API_SPORTS_BASE_URLS[sportType];
  if (!baseUrl) {
    throw new TeamSearchError(`Unsupported sport type: ${sportType}`, "client");
  }

  const apiKey = import.meta.env.VITE_API_SPORTS_KEY;
  if (!apiKey) {
    throw new TeamSearchError("API key not configured", "client");
  }

  const url = `${baseUrl}/teams?search=${encodeURIComponent(query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "x-apisports-key": apiKey },
    });
  } catch (error) {
    throw new TeamSearchError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "network"
    );
  }

  if (!response.ok) {
    throw classifyHttpError(response.status, response.statusText);
  }

  const data = await response.json();
  return mapApiSportsResponse(data.response, sportType);
};

// ──────────────────────────────────────────────────
// Internal: TheSportsDB (NBA) Search
// ──────────────────────────────────────────────────

const searchNbaTeams = async (query: string): Promise<GenericTeam[]> => {
  const allTeams = await fetchAllNbaTeams();
  const lowerQuery = query.toLowerCase();
  return allTeams.filter((team) =>
    team.name.toLowerCase().includes(lowerQuery)
  );
};

// ──────────────────────────────────────────────────
// Response Mappers
// ──────────────────────────────────────────────────

const mapApiSportsResponse = (
  response: Record<string, unknown>[] | undefined,
  sportType: TournamentType
): GenericTeam[] => {
  if (!(response && Array.isArray(response))) {
    return [];
  }
  return response.map((item) => {
    const teamData =
      "team" in item ? (item.team as Record<string, unknown>) : item;

    return {
      country: mapApiSportsCountry(teamData),
      id: Number(teamData.id ?? 0),
      league: teamData.league ? Number(teamData.league) : undefined,
      logo: teamData.logo ? String(teamData.logo) : undefined,
      name: String(teamData.name ?? ""),
      type: sportType,
    };
  });
};

const mapTheSportsDbResponse = (
  teams: Record<string, string>[]
): GenericTeam[] =>
  teams.map((team) => ({
    country: team.strCountry
      ? { code: team.strCountry, flag: "", id: 0, name: team.strCountry }
      : undefined,
    id: Number(team.idTeam ?? 0),
    logo: resolveNbaLogo(team),
    name: team.strTeam ?? "",
    type: "NBA" as TournamentType,
  }));

const resolveNbaLogo = (team: Record<string, string>): string | undefined => {
  if (team.strTeamBadge) {
    return `${team.strTeamBadge}/small`;
  }
  if (team.strBadge) {
    return `${team.strBadge}/small`;
  }
  return;
};

const mapApiSportsCountry = (
  teamData: Record<string, unknown>
): GenericTeam["country"] => {
  const countryData = teamData.country;
  if (!(countryData && typeof countryData === "object")) {
    return;
  }
  const country = countryData as Record<string, unknown>;
  return {
    code: String(country.code ?? ""),
    flag: String(country.flag ?? ""),
    id: Number(country.id ?? 0),
    name: String(country.name ?? ""),
  };
};

// ──────────────────────────────────────────────────
// Error Classification
// ──────────────────────────────────────────────────

const classifyHttpError = (
  status: number,
  statusText: string
): TeamSearchError => {
  if (status === 429) {
    return new TeamSearchError("Rate limit exceeded", "rate_limit", status);
  }
  if (status === 404) {
    return new TeamSearchError("Not found", "not_found", status);
  }
  if (status >= 500) {
    return new TeamSearchError(`Server error: ${statusText}`, "server", status);
  }
  return new TeamSearchError(`Client error: ${statusText}`, "client", status);
};
