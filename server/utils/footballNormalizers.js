const toCamelCase = (value) => {
  if (typeof value !== "string") return value;

  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const normalizeKeys = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeKeys(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      const normalizedKey = toCamelCase(key);
      acc[normalizedKey] = normalizeKeys(nestedValue);
      return acc;
    }, {});
  }

  return value;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const getProviderValue = (source, candidateKeys) => {
  for (const key of candidateKeys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

export const normalizeMatch = (entry = {}) => {
  const source = normalizeKeys(entry);
  const league = source.league || source.competition || {};
  const homeTeam = source.homeTeam || source.home_team || source.home || {};
  const awayTeam = source.awayTeam || source.away_team || source.away || {};
  const fixture = source.fixture || {};

  const matchId = getProviderValue(source, ["matchId", "id", "fixtureId", "fixture.id"]) ?? fixture.id ?? null;
  const leagueId = getProviderValue(league, ["leagueId", "id"]) ?? source.leagueId ?? null;
  const leagueName = getProviderValue(league, ["leagueName", "name"]) ?? source.leagueName ?? null;
  const country = getProviderValue(league, ["country", "countryName", "area.name"]) ?? source.country ?? null;

  const kickoffTime = getProviderValue(source, ["kickoffTime", "startTime", "date", "eventTime"]) ?? fixture.date ?? null;
  const prediction = getProviderValue(source, ["prediction", "tip", "pick", "marketPrediction"]) ?? source.selection ?? null;
  const probability = toNumberOrNull(getProviderValue(source, ["probability", "winProbability", "chance", "confidence"])) ?? null;
  const odds = toNumberOrNull(getProviderValue(source, ["odds", "odd", "marketOdds", "price"])) ?? null;
  const confidence = toNumberOrNull(getProviderValue(source, ["confidence", "confidenceLevel", "confidenceScore"])) ?? null;
  const status = getProviderValue(source, ["status", "state", "matchStatus"]) ?? "scheduled";
  const market = getProviderValue(source, ["market", "bettingMarket", "predictionType"]) ?? "matchWinner";
  const analysis = getProviderValue(source, ["analysis", "summary", "tipAnalysis"]) ?? source.comment ?? null;

  return {
    matchId,
    leagueId,
    leagueName,
    country,
    homeTeam: getProviderValue(homeTeam, ["name", "teamName", "fullName"]) ?? source.homeTeamName ?? null,
    awayTeam: getProviderValue(awayTeam, ["name", "teamName", "fullName"]) ?? source.awayTeamName ?? null,
    kickoffTime: kickoffTime ? new Date(kickoffTime).toISOString() : null,
    prediction,
    probability,
    odds,
    confidence,
    status,
    homeLogo: getProviderValue(homeTeam, ["logo", "imageUrl"]) ?? source.homeLogo ?? null,
    awayLogo: getProviderValue(awayTeam, ["logo", "imageUrl"]) ?? source.awayLogo ?? null,
    leagueLogo: getProviderValue(league, ["logo", "imageUrl"]) ?? source.leagueLogo ?? null,
    isPremium: Boolean(source.isPremium ?? false),
    isFeatured: Boolean(source.isFeatured ?? false),
    market,
    analysis,
  };
};

export const normalizeList = (payload = []) => {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.matches || [];
  return items.map((item) => normalizeMatch(item));
};

export const normalizeStandings = (payload = []) => {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.standings || [];

  return items.map((item) => {
    const normalized = normalizeKeys(item);
    return {
      teamId: normalized.teamId ?? normalized.id ?? null,
      teamName: normalized.teamName ?? normalized.name ?? null,
      position: normalized.position ?? normalized.rank ?? null,
      played: normalized.played ?? normalized.matchesPlayed ?? null,
      wins: normalized.wins ?? normalized.win ?? null,
      draws: normalized.draws ?? normalized.draw ?? null,
      losses: normalized.losses ?? normalized.loss ?? null,
      points: normalized.points ?? null,
      goalsFor: normalized.goalsFor ?? null,
      goalsAgainst: normalized.goalsAgainst ?? null,
      goalDifference: normalized.goalDifference ?? null,
    };
  });
};

export const normalizeTeams = (payload = []) => {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.teams || [];

  return items.map((item) => {
    const normalized = normalizeKeys(item);
    return {
      teamId: normalized.teamId ?? normalized.id ?? null,
      teamName: normalized.teamName ?? normalized.name ?? null,
      shortName: normalized.shortName ?? normalized.short ?? null,
      country: normalized.country ?? null,
      logo: normalized.logo ?? normalized.imageUrl ?? null,
    };
  });
};

export const normalizeLeagues = (payload = []) => {
  const items = Array.isArray(payload) ? payload : payload?.data || payload?.leagues || [];

  return items.map((item) => {
    const normalized = normalizeKeys(item);
    return {
      leagueId: normalized.leagueId ?? normalized.id ?? null,
      leagueName: normalized.leagueName ?? normalized.name ?? null,
      country: normalized.country ?? null,
      logo: normalized.logo ?? normalized.imageUrl ?? null,
      season: normalized.season ?? null,
    };
  });
};
