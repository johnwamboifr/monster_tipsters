import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./football-api";

const sortFixtures = (fixtures = []) =>
  [...fixtures].sort((left, right) => {
    const leftTime = new Date(left.kickoffTime || 0).getTime();
    const rightTime = new Date(right.kickoffTime || 0).getTime();
    return leftTime - rightTime;
  });

const resolveErrorMessage = (payload, error) => {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload?.error) {
    return payload.error;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.data?.message) {
    return payload.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Unable to complete the request.";
};

const normalizeStandingsPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.response)) {
    return payload.response;
  }

  if (Array.isArray(payload?.standings)) {
    return payload.standings;
  }

  return [];
};

const normalizeStanding = (standing = {}) => {
  const raw = standing?.dataValues || standing || {};
  const league = raw.League || raw.league || {};
  const team = raw.Team || raw.team || {};

  return {
    ...raw,
    ...standing,
    leagueId: raw.leagueId || league.leagueId || "",
    leagueName: raw.leagueName || league.name || "",
    leagueLogo: raw.leagueLogo || league.logo || "",
    teamId: raw.teamId || team.teamId || "",
    teamName: raw.teamName || team.name || raw.name || "",
    teamShortName: raw.teamShortName || team.shortName || "",
    teamTla: raw.teamTla || team.tla || "",
    teamLogo: raw.teamLogo || team.logo || "",
    position: raw.position ?? 0,
    playedGames: raw.playedGames ?? 0,
    won: raw.won ?? 0,
    draw: raw.draw ?? 0,
    lost: raw.lost ?? 0,
    points: raw.points ?? 0,
    goalsFor: raw.goalsFor ?? 0,
    goalsAgainst: raw.goalsAgainst ?? 0,
    goalDifference: raw.goalDifference ?? 0,
    season: raw.season ?? "",
    group: raw.group ?? "",
  };
};

const normalizePredictionPayload = (prediction = {}) => {
  const raw = prediction?.dataValues || prediction || {};
  const match = raw.match || prediction?.match || {};
  const league = raw.League || match.League || prediction?.League || {};
  const homeTeam = raw.homeTeam || match.homeTeam || prediction?.homeTeam || {};
  const awayTeam = raw.awayTeam || match.awayTeam || prediction?.awayTeam || {};

  return {
    ...raw,
    ...prediction,
    id: raw.id || prediction?.id,
    fixtureId: raw.fixtureId || raw.matchId || prediction?.fixtureId || prediction?.matchId || match.matchId,
    matchId: raw.matchId || prediction?.matchId || match.matchId,
    league: raw.league || league.name || "",
    leagueLogo: raw.leagueLogo || league.logo || "",
    homeTeam: raw.homeTeam || homeTeam.name || "",
    awayTeam: raw.awayTeam || awayTeam.name || "",
    homeTeamLogo: raw.homeTeamLogo || homeTeam.logo || "",
    awayTeamLogo: raw.awayTeamLogo || awayTeam.logo || "",
    kickoffTime: raw.kickoffTime || match.kickoffTime || prediction?.kickoffTime,
    status: raw.status || match.status || prediction?.status || "",
    prediction: raw.prediction || prediction?.prediction || "",
    market: raw.market || prediction?.market || "",
    odds: raw.odds ?? prediction?.odds ?? "",
    confidence: raw.confidence ?? prediction?.confidence ?? "",
    analysis: raw.analysis || prediction?.analysis || "",
    result: raw.result || prediction?.result || "pending",
    isPremium: Boolean(raw.isPremium ?? prediction?.isPremium),
    isFeatured: Boolean(raw.isFeatured ?? prediction?.isFeatured),
    isPublished: Boolean(raw.isPublished ?? prediction?.isPublished ?? raw.publishedAt ?? prediction?.publishedAt),
    publishedAt: raw.publishedAt || prediction?.publishedAt,
    match: raw.match || prediction?.match || null,
  };
};

const normalizeFinishedMatch = (match = {}) => {
  const raw = match?.dataValues || match || {};
  const league = raw.League || match?.League || {};
  const homeTeam = raw.homeTeam || match?.homeTeam || {};
  const awayTeam = raw.awayTeam || match?.awayTeam || {};
  const prediction = raw.prediction || match?.prediction || {};

  return {
    ...raw,
    ...match,
    league: raw.league || league.name || "",
    leagueLogo: raw.leagueLogo || league.logo || "",
    homeTeam: raw.homeTeam || homeTeam.name || "",
    awayTeam: raw.awayTeam || awayTeam.name || "",
    homeTeamLogo: raw.homeTeamLogo || homeTeam.logo || "",
    awayTeamLogo: raw.awayTeamLogo || awayTeam.logo || "",
    prediction: prediction.prediction || raw.prediction || null,
    predictionResult: prediction.result || raw.predictionResult || raw.result || "Pending",
    predictionMarket: prediction.market || raw.predictionMarket || null,
    predictionOdds: prediction.odds ?? raw.predictionOdds ?? null,
    predictionConfidence: prediction.confidence ?? raw.predictionConfidence ?? null,
  };
};

const normalizeFixture = (fixture = {}) => {
  const league = fixture.league || fixture.League || {};
  const homeTeam = fixture.homeTeam || {};
  const awayTeam = fixture.awayTeam || {};
  const prediction = fixture.prediction || fixture.predictions?.[0] || null;

  return {
    ...fixture,
    leagueId: fixture.leagueId || league.leagueId || league.id || "",
    league: fixture.leagueName || league.name || fixture.league || "",
    leagueLogo: league.logo || fixture.leagueLogo || "",
    homeTeam: fixture.homeTeamName || homeTeam.name || fixture.homeTeam || "",
    homeTeamLogo: homeTeam.logo || fixture.homeTeamLogo || "",
    awayTeam: fixture.awayTeamName || awayTeam.name || fixture.awayTeam || "",
    awayTeamLogo: awayTeam.logo || fixture.awayTeamLogo || "",
    kickoffTime: fixture.kickoffTime || fixture.kickoff || "",
    status: fixture.status || fixture.matchStatus || "SCHEDULED",
    prediction: prediction
      ? {
        ...prediction,
        prediction: prediction.prediction || prediction.tip || "",
        market: prediction.market || "Match Winner",
        odds: prediction.odds ?? "",
        confidence: prediction.confidence ?? "",
        analysis: prediction.analysis || "",
        isFeatured: Boolean(prediction.isFeatured),
        isPremium: Boolean(prediction.isPremium),
        isPublished: Boolean(prediction.isPublished || prediction.publishedAt),
        result: prediction.result || "pending",
      }
      : fixture.prediction || null,
  };
};

const normalizeSeason = (season = {}) => season?.dataValues || season || {};
const normalizeScorer = (scorer = {}) => scorer?.dataValues || scorer || {};

// Home
export const fetchHomeData = createAsyncThunk(
  "football/fetchHomeData",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/home");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Free Predictions
export const fetchFreePredictions = createAsyncThunk(
  "football/fetchFreePredictions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/predictions/free");
      const payload = Array.isArray(data?.data) ? data.data : [];
      if (import.meta.env.DEV) {
        console.debug("[football] free predictions payload", payload);
      }
      return payload.map(normalizePredictionPayload);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Premium Predictions
export const fetchPremiumPredictions = createAsyncThunk(
  "football/fetchPremiumPredictions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/predictions/premium");
      const payload = Array.isArray(data?.data) ? data.data : [];
      return payload.map(normalizePredictionPayload);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Prediction By Fixture
export const fetchPredictionByFixture = createAsyncThunk(
  "football/fetchPredictionByFixture",
  async (fixtureId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/football/predictions/${fixtureId}`);
      const payload = Array.isArray(data?.data) ? data.data : [];
      const prediction = payload[0] || null;

      return {
        fixtureId,
        prediction: prediction
          ? {
            fixture: {
              league: prediction.league,
              leagueLogo: prediction.leagueLogo,
              homeTeam: prediction.homeTeam,
              awayTeam: prediction.awayTeam,
              homeTeamLogo: prediction.homeTeamLogo,
              awayTeamLogo: prediction.awayTeamLogo,
              kickoffTime: prediction.kickoffTime,
              status: prediction.status,
            },
            prediction: normalizePredictionPayload(prediction),
          }
          : null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Fixtures
export const fetchFixtures = createAsyncThunk(
  "football/fetchFixtures",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/fixtures", { params });
      return sortFixtures((data.data || []).map(normalizeFixture));
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchAdminFixtures = createAsyncThunk(
  "football/fetchAdminFixtures",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/fixtures", {
        params: { limit: 200 },
      });
      return sortFixtures((data.data || []).map(normalizeFixture));
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const saveAdminPredictionThunk = createAsyncThunk(
  "football/saveAdminPredictionThunk",
  async ({ fixtureId, method = "POST", payload }, { rejectWithValue }) => {
    try {
      const requestMethod = String(method || "POST").toUpperCase();
      const endpoint = requestMethod === "PUT" ? `/football/predictions/${fixtureId}` : "/football/predictions";
      const { data } = await api.request(endpoint, {
        method: requestMethod,
        data: {
          fixtureId,
          ...payload,
        },
      });

      const savedPrediction = data?.data || data;
      const predictionPayload = normalizePredictionPayload(savedPrediction);

      return {
        fixtureId,
        fixture: normalizeFixture({
          ...savedPrediction,
          prediction: predictionPayload,
        }),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Results
export const fetchResults = createAsyncThunk(
  "football/fetchResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/results", { params });
      const payload = Array.isArray(data?.data) ? data.data : [];
      if (import.meta.env.DEV) {
        console.debug("[football] results payload", payload);
      }
      return payload.map(normalizeFinishedMatch);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Standings
export const fetchStandings = createAsyncThunk(
  "football/fetchStandings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const normalizedParams = typeof params === "string"
        ? { league: params }
        : params || {};

      const queryParams = Object.fromEntries(
        Object.entries({ limit: 500, ...normalizedParams }).filter(([, value]) => value !== undefined && value !== null && value !== "")
      );

      if (import.meta.env.DEV) {
        console.debug("[standings] request", { url: "/football/standings", params: queryParams });
      }

      const { data } = await api.get("/football/standings", { params: queryParams });

      if (import.meta.env.DEV) {
        console.debug("[standings] response", { status: data?.success ? 200 : 500, payload: data });
      }

      if (typeof data === "string" && data.trim().startsWith("<")) {
        return rejectWithValue({ message: "Received HTML instead of JSON from the standings endpoint." });
      }

      const normalized = normalizeStandingsPayload(data);

      if (import.meta.env.DEV) {
        console.debug("[standings] normalized payload", { count: normalized.length, sample: normalized.slice(0, 3) });
      }

      return normalized.map(normalizeStanding);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Leagues
export const fetchLeagues = createAsyncThunk(
  "football/fetchLeagues",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/leagues");
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchSeasons = createAsyncThunk(
  "football/fetchSeasons",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/seasons", { params });
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchScorers = createAsyncThunk(
  "football/fetchScorers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/scorers", { params });
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Teams
export const fetchTeams = createAsyncThunk(
  "football/fetchTeams",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/football/teams");
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const loadingState = {
  homeData: false,
  freePredictions: false,
  premiumPredictions: false,
  prediction: false,
  fixtures: false,
  results: false,
  standings: false,
  leagues: false,
  teams: false,
  adminFixtures: false,
  seasons: false,
  scorers: false,
};

const errorState = {
  homeData: null,
  freePredictions: null,
  premiumPredictions: null,
  prediction: null,
  fixtures: null,
  results: null,
  standings: null,
  leagues: null,
  teams: null,
  adminFixtures: null,
  seasons: null,
  scorers: null,
};

const initialState = {
  home: null,
  freePredictions: [],
  premiumPredictions: [],
  fixtures: [],
  results: [],
  standings: [],
  leagues: [],
  teams: [],
  seasons: [],
  scorers: [],
  prediction: null,
  adminFixtures: [],
  standingsFilters: { league: "", season: "", group: "", stage: "" },
  resultsFilters: { league: "", season: "", status: "", search: "" },
  fixturesFilters: { league: "", season: "", stage: "", group: "", matchday: "", status: "", date: "", search: "" },

  loading: loadingState,
  errors: errorState,
  loadingStatus: false,
  error: null,
};

const loadingKeyMap = {
  fetchHomeData: "homeData",
  fetchFreePredictions: "freePredictions",
  fetchPremiumPredictions: "premiumPredictions",
  fetchPredictionByFixture: "prediction",
  fetchFixtures: "fixtures",
  fetchResults: "results",
  fetchStandings: "standings",
  fetchLeagues: "leagues",
  fetchTeams: "teams",
  fetchSeasons: "seasons",
  fetchScorers: "scorers",
  fetchAdminFixtures: "adminFixtures",
  saveAdminPredictionThunk: "adminFixtures",
};

const getLoadingKey = (actionType) => {
  const match = actionType.match(/^football\/([^/]+)\/(pending|fulfilled|rejected)$/);
  if (!match) {
    return null;
  }

  return loadingKeyMap[match[1]] || match[1];
};

const footballSlice = createSlice({
  name: "football",
  initialState,
  reducers: {
    clearFootballError(state) {
      state.error = null;
      state.loadingStatus = false;
      state.errors = {
        ...state.errors,
        adminFixtures: null,
      };
    },
    setStandingsFilters(state, action) {
      state.standingsFilters = {
        ...state.standingsFilters,
        ...action.payload,
      };
    },
    clearStandings(state) {
      state.standings = [];
    },
    setResultsFilters(state, action) {
      state.resultsFilters = {
        ...state.resultsFilters,
        ...action.payload,
      };
    },
    setFixturesFilters(state, action) {
      state.fixturesFilters = {
        ...state.fixturesFilters,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith("football/") && action.type.endsWith("/pending"),
        (state, action) => {
          const loadingKey = getLoadingKey(action.type);
          state.loadingStatus = true;
          state.error = null;

          if (loadingKey) {
            state.loading[loadingKey] = true;
            state.errors[loadingKey] = null;
          }
        }
      )

      .addMatcher(
        (action) => action.type.startsWith("football/") && action.type.endsWith("/rejected"),
        (state, action) => {
          const loadingKey = getLoadingKey(action.type);
          const message = resolveErrorMessage(action.payload, action.error);
          state.loadingStatus = false;
          state.error = message;

          if (loadingKey) {
            state.loading[loadingKey] = false;
            state.errors[loadingKey] = message;
          }
        }
      )

      .addMatcher(
        (action) => action.type.startsWith("football/") && action.type.endsWith("/fulfilled"),
        (state, action) => {
          const loadingKey = getLoadingKey(action.type);
          state.loadingStatus = false;

          if (loadingKey) {
            state.loading[loadingKey] = false;
          }
        }
      )

      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.home = action.payload;
      })

      .addCase(fetchFreePredictions.fulfilled, (state, action) => {
        state.freePredictions = action.payload;
      })

      .addCase(fetchPremiumPredictions.fulfilled, (state, action) => {
        state.premiumPredictions = action.payload;
      })

      .addCase(fetchFixtures.fulfilled, (state, action) => {
        state.fixtures = action.payload;
      })

      .addCase(fetchAdminFixtures.fulfilled, (state, action) => {
        state.adminFixtures = action.payload;
      })

      .addCase(saveAdminPredictionThunk.fulfilled, (state, action) => {
        if (!action.payload?.fixture) {
          return;
        }

        const updatedFixture = normalizeFixture(action.payload.fixture);
        state.adminFixtures = state.adminFixtures.map((fixture) => {
          const sameFixture = fixture.fixtureId === updatedFixture.fixtureId || fixture.matchId === updatedFixture.matchId;
          return sameFixture ? { ...fixture, prediction: updatedFixture.prediction } : fixture;
        });
      })

      .addCase(fetchResults.fulfilled, (state, action) => {
        state.results = action.payload;
      })

      .addCase(fetchStandings.fulfilled, (state, action) => {
        state.standings = action.payload;
      })

      .addCase(fetchLeagues.fulfilled, (state, action) => {
        state.leagues = action.payload;
      })

      .addCase(fetchSeasons.fulfilled, (state, action) => {
        state.seasons = action.payload.map(normalizeSeason);
      })

      .addCase(fetchScorers.fulfilled, (state, action) => {
        state.scorers = action.payload.map(normalizeScorer);
      })

      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      })

      .addCase(fetchPredictionByFixture.fulfilled, (state, action) => {
        state.prediction = action.payload.prediction;
      });
  },
});

export const { clearStandings,clearFootballError, setStandingsFilters, setResultsFilters, setFixturesFilters } = footballSlice.actions;

export default footballSlice.reducer;
