import db from "../../models/index.js";
import { buildLog, normalizeString } from "../footballSyncHelpers.js";
import { requestFootballApi, withRetry } from "../footballApiClient.js";
import { isFootballApiConfigured } from "../../config/football-api.js";

const { League } = db;

const buildLeaguePayload = (item) => ({
  leagueId: normalizeString(item?.id ?? item?.leagueId),
  name: normalizeString(item?.name),
  code: normalizeString(item?.code),
  country: normalizeString(item?.area?.name || item?.country),
  logo: normalizeString(item?.emblem || item?.logo),
});

const upsertLeague = async (values) => {
  if (!values.leagueId) {
    return {
      record: null,
      created: false,
      updated: false,
      skipped: true,
    };
  }

  const existing = await League.findOne({
    where: {
      leagueId: values.leagueId,
    },
  });

  if (existing) {
    await existing.update(values);

    return {
      record: existing,
      created: false,
      updated: true,
    };
  }

  const created = await League.create(values);

  return {
    record: created,
    created: true,
    updated: false,
  };
};

/**
 * Synchronize football-data.org competitions.
 *
 * competitionCodes contains football-data.org
 * competition codes such as:
 *
 * PL, CL, BL1, SA, PD, FL1
 *
 * The provider's numeric competition ID is still
 * stored in our database as leagueId.
 */

export const syncLeagues = async (competitionCodes = null) => {
  const startedAt = Date.now();

  const stats = {
    requests: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  if (!isFootballApiConfigured()) {
    buildLog("syncLeagues", "Football API is not configured.");
    return stats;
  }

 // buildLog("syncLeagues", "Starting league sync");
  buildLog(
  "syncLeagues",
  "Starting league sync",
  {
    competitionCodes:
      Array.isArray(competitionCodes) &&
      competitionCodes.length
        ? competitionCodes
        : "ALL",
  }
);

  try {
    const payload = await withRetry(() =>
      requestFootballApi("/competitions", {})
    );

    stats.requests += 1;

    const competitions = Array.isArray(payload?.competitions)
      ? payload.competitions
      : [];

    for (const competition of competitions) {
      try {
        const values = buildLeaguePayload(competition);

        if (!values.leagueId) {
          stats.skipped += 1;
          continue;
        }

        if (
  Array.isArray(competitionCodes) &&
  competitionCodes.length
) {
  const allowedCodes = competitionCodes.map((code) =>
    String(code).trim().toUpperCase()
  );

  const competitionCode = normalizeString(
    competition?.code
  )?.toUpperCase();

  if (
    !competitionCode ||
    !allowedCodes.includes(competitionCode)
  ) {
    stats.skipped += 1;
    continue;
  }
        }
        
        const result = await upsertLeague(values);

        if (result.created) stats.created += 1;
        if (result.updated) stats.updated += 1;
      } catch (error) {
        stats.errors += 1;

        buildLog(
          "syncLeagues",
          `Failed to sync league ${competition?.name || "unknown"}`,
          {
            error: error.message,
          }
        );
      }
    }
  } catch (error) {
    stats.errors += 1;

    buildLog("syncLeagues", "Failed to fetch league data", {
      error: error.message,
    });
  }

  buildLog("syncLeagues", "League sync complete", {
    ...stats,
    durationMs: Date.now() - startedAt,
  });

  return stats;
};

export default syncLeagues;
