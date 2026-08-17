import { requestFootballApi, withRetry } from "./footballApiClient.js";
import { isFootballApiConfigured } from "../config/football-api.js";
import { normalizeLeagues, normalizeList, normalizeStandings, normalizeTeams } from "./footballNormalizers.js";
import { validateLeagueId, validateRequiredValue } from "./footballValidators.js";

const getExternalPredictionData = async (endpoint, params = {}) => {
  if (!isFootballApiConfigured()) {
    return [];
  }

  return withRetry(async () => requestFootballApi(endpoint, params));
};

export const getTodayPredictions = async () => {
  const payload = await getExternalPredictionData("/predictions/today");
  return normalizeList(payload);
};

export const getTomorrowPredictions = async () => {
  const payload = await getExternalPredictionData("/predictions/tomorrow");
  return normalizeList(payload);
};

export const getMatchDetails = async (matchId) => {
  const validatedMatchId = validateRequiredValue(matchId, "matchId");
  const payload = await getExternalPredictionData(`/matches/${validatedMatchId}`);
  const normalizedMatch = normalizeList(payload);
  return normalizedMatch[0] || null;
};

export const getLiveMatches = async () => {
  const payload = await getExternalPredictionData("/liveMatches");
  return normalizeList(payload);
};

export const getFinishedMatches = async () => {
  const payload = await getExternalPredictionData("/finishedMatches");
  return normalizeList(payload);
};

export const getFixtures = async (params = {}) => {
  if (!isFootballApiConfigured()) {
    return [];
  }

  const payload = await withRetry(() => requestFootballApi("/matches", params));
  return normalizeList(payload);
};

export const getStandings = async (leagueId) => {
  if (!isFootballApiConfigured()) {
    return [];
  }

  const validatedLeagueId = validateLeagueId(leagueId);
  const payload = await withRetry(() => requestFootballApi(`/standings/${validatedLeagueId}`));
  return normalizeStandings(payload);
};

export const getTeams = async (params = {}) => {
  if (!isFootballApiConfigured()) {
    return [];
  }

  const payload = await withRetry(() => requestFootballApi("/teams", params));
  return normalizeTeams(payload);
};

export const getLeagues = async (params = {}) => {
  if (!isFootballApiConfigured()) {
    return [];
  }

  const payload = await withRetry(() => requestFootballApi("/leagues", params));
  return normalizeLeagues(payload);
};
