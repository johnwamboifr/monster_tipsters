// server/utils/sync/footballSyncService.js

import { syncLeagues } from "./leagueSync.js";
import { syncTeams } from "./teamSync.js";
import { syncFixtures } from "./fixtureSync.js";
import { syncStandings } from "./standingSync.js";
import { syncFinishedMatches } from "./resultSync.js";

/*
 * ============================================================
 * FOOTBALL COMPETITIONS
 * ============================================================
 *
 * You can override this in Render with:
 *
 * FOOTBALL_COMPETITIONS=PL,PD,BL1,SA,FL1,PPL,DED,ELC,BSA,JPL,CL,EL,WC
 *
 * These are football-data.org competition codes.
 */

const DEFAULT_COMPETITIONS = [
  "PL",
  "PD",
  "BL1",
  "SA",
  "FL1",
  "PPL",
  "DED",
  "ELC",
  "BSA",
  "JPL",
  "CL",
  "EL",
  "WC",
];

/*
 * ============================================================
 * PARSE COMPETITIONS
 * ============================================================
 */

const parseCompetitions = (value) => {
  if (!value) {
    return [...DEFAULT_COMPETITIONS];
  }

  const competitions = String(value)
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return [...new Set(competitions)];
};

export const FOOTBALL_COMPETITIONS =
  parseCompetitions(
    process.env.FOOTBALL_COMPETITIONS
  );

/*
 * ============================================================
 * LOGGING
 * ============================================================
 */

const logSync = (
  message,
  context = {}
) => {
  console.log(
    "[Football Sync]",
    {
      message,
      ...context,
    }
  );
};

/*
 * ============================================================
 * TASK RUNNER
 * ============================================================
 *
 * Individual sync failures are returned instead of crashing
 * the entire scheduler.
 */

const runTask = async (
  name,
  task
) => {
  const startedAt = Date.now();

  try {
    logSync(
      `Starting ${name}`
    );

    const result = await task();

    const response = {
      success: true,
      result,
    };

    logSync(
      `Completed ${name}`,
      {
        durationMs:
          Date.now() - startedAt,

        result,
      }
    );

    return response;
  } catch (error) {
    const message =
      error?.message ||
      `${name} failed.`;

    logSync(
      `${name} failed`,
      {
        error: message,
        stack: error?.stack,
      }
    );

    return {
      success: false,
      error: message,
    };
  }
};

/*
 * ============================================================
 * SYNCHRONIZATION LOCK
 * ============================================================
 *
 * Prevent two complete synchronizations from running at
 * the same time.
 */

let syncRunning = false;

/*
 * ============================================================
 * LEAGUES
 * ============================================================
 */

export const syncLeagueData = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return runTask(
    "league synchronization",
    () =>
      syncLeagues(
        competitionCodes
      )
  );
};

/*
 * ============================================================
 * TEAMS
 * ============================================================
 */

export const syncTeamData = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return runTask(
    "team synchronization",
    () =>
      syncTeams(
        competitionCodes
      )
  );
};

/*
 * ============================================================
 * FIXTURES
 * ============================================================
 */

export const syncFixtureData = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return runTask(
    "fixture synchronization",
    () =>
      syncFixtures(
        competitionCodes
      )
  );
};

/*
 * ============================================================
 * STANDINGS
 * ============================================================
 */

export const syncStandingData = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return runTask(
    "standing synchronization",
    () =>
      syncStandings(
        competitionCodes
      )
  );
};

/*
 * ============================================================
 * RESULTS
 * ============================================================
 *
 * Results do not need competition codes because the result
 * synchronization has its own logic.
 */

export const syncResultData = async () => {
  return runTask(
    "result synchronization",
    syncFinishedMatches
  );
};

/*
 * ============================================================
 * FULL FOOTBALL SYNCHRONIZATION
 * ============================================================
 *
 * Order:
 *
 * 1. Leagues
 * 2. Teams
 * 3. Fixtures
 * 4. Standings
 *
 * Results intentionally remain separate.
 */

export const runFootballSync = async () => {
  if (syncRunning) {
    logSync(
      "Full synchronization already running. Skipping."
    );

    return {
      success: false,
      skipped: true,
      reason: "sync_already_running",
    };
  }

  syncRunning = true;

  const startedAt = Date.now();

  const result = {
    success: true,

    competitions:
      FOOTBALL_COMPETITIONS,

    leagues: null,
    teams: null,
    fixtures: null,
    standings: null,
  };

  try {
    logSync(
      "Starting full football synchronization",
      {
        competitions:
          FOOTBALL_COMPETITIONS,
      }
    );

    /*
     * --------------------------------------------------------
     * 1. LEAGUES
     * --------------------------------------------------------
     */

    result.leagues =
      await syncLeagueData(
        FOOTBALL_COMPETITIONS
      );

    /*
     * --------------------------------------------------------
     * 2. TEAMS
     * --------------------------------------------------------
     */

    result.teams =
      await syncTeamData(
        FOOTBALL_COMPETITIONS
      );

    /*
     * --------------------------------------------------------
     * 3. FIXTURES
     * --------------------------------------------------------
     */

    result.fixtures =
      await syncFixtureData(
        FOOTBALL_COMPETITIONS
      );

    /*
     * --------------------------------------------------------
     * 4. STANDINGS
     * --------------------------------------------------------
     */

    result.standings =
      await syncStandingData(
        FOOTBALL_COMPETITIONS
      );

    result.success =
      result.leagues?.success === true &&
      result.teams?.success === true &&
      result.fixtures?.success === true &&
      result.standings?.success === true;

    logSync(
      "Full football synchronization completed",
      {
        success:
          result.success,

        durationMs:
          Date.now() - startedAt,
      }
    );

    return result;
  } catch (error) {
    /*
     * This is an unexpected error outside the individual
     * task handlers.
     */

    result.success = false;
    result.error =
      error?.message ||
      "Full football synchronization failed.";

    logSync(
      "Full football synchronization failed",
      {
        error:
          result.error,

        stack:
          error?.stack,
      }
    );

    return result;
  } finally {
    syncRunning = false;
  }
};

/*
 * ============================================================
 * COMPATIBILITY ALIASES
 * ============================================================
 *
 * These keep compatibility with code that already uses the
 * runXSync naming convention.
 */

export const runLeagueSync = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return syncLeagueData(
    competitionCodes
  );
};

export const runTeamSync = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return syncTeamData(
    competitionCodes
  );
};

export const runFixtureSync = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return syncFixtureData(
    competitionCodes
  );
};

export const runStandingSync = async (
  competitionCodes = FOOTBALL_COMPETITIONS
) => {
  return syncStandingData(
    competitionCodes
  );
};

export const runResultSync = async () => {
  return syncResultData();
};

/*
 * ============================================================
 * INITIAL SYNCHRONIZATION
 * ============================================================
 */

export const runInitialSync = async () => {
  logSync(
    "Starting initial football synchronization"
  );

  const result =
    await runFootballSync();

  logSync(
    "Initial football synchronization completed",
    {
      success:
        result?.success,
    }
  );

  return result;
};

/*
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  FOOTBALL_COMPETITIONS,

  syncLeagueData,
  syncTeamData,
  syncFixtureData,
  syncStandingData,
  syncResultData,

  runFootballSync,
  runInitialSync,

  runLeagueSync,
  runTeamSync,
  runFixtureSync,
  runStandingSync,
  runResultSync,
};
