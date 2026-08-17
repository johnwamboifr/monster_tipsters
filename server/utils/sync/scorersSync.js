import db from "../../models/index.js";
import {
  buildLog,
  getApplicationSeason,
  normalizeString,
  sleep,
} from "../footballSyncHelpers.js";
import {
  requestFootballApi,
  withRetry,
} from "../footballApiClient.js";
import { isFootballApiConfigured } from "../../config/football-api.js";

const {
  Scorer,
  League,
  Team,
} = db;

/**
 * Build a scorer payload from football-data.org data.
 */
const buildScorerPayload = (
  item,
  competitionId,
  season,
  teamId = null
) => {
  const playerId = normalizeString(
    item?.player?.id ??
      item?.playerId
  );

  const playerName = normalizeString(
    item?.player?.name ??
      item?.playerName ??
      [
        item?.player?.firstName,
        item?.player?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
  );

  return {
    competitionId: normalizeString(
      competitionId
    ),

    season: normalizeString(
      season
    ),

    playerId,

    playerName,

    /*
     * Only store the teamId if the team exists
     * in our Teams table.
     *
     * This prevents:
     *
     * FOREIGN KEY constraint fails
     *
     * when the API returns a player whose team
     * has not yet been synchronized.
     */
    teamId: normalizeString(
      teamId
    ) || null,

    teamName: normalizeString(
      item?.team?.name ??
        item?.teamName
    ) || null,

    goals:
      item?.goals != null
        ? Number(item.goals)
        : 0,

    assists:
      item?.assists != null
        ? Number(item.assists)
        : null,

    penalties:
      item?.penalties != null
        ? Number(item.penalties)
        : null,

    matchesPlayed:
      item?.playedMatches != null
        ? Number(item.playedMatches)
        : item?.matchesPlayed != null
          ? Number(item.matchesPlayed)
          : null,
  };
};

/**
 * Find an existing scorer.
 */
const findScorer = async (values) => {
  return Scorer.findOne({
    where: {
      competitionId:
        values.competitionId,

      season:
        values.season,

      playerId:
        values.playerId,
    },
  });
};

/**
 * Insert or update a scorer.
 */
const upsertScorer = async (values) => {
  if (
    !values.competitionId ||
    !values.season ||
    !values.playerId ||
    !values.playerName
  ) {
    return {
      record: null,
      created: false,
      updated: false,
    };
  }

  const existing =
    await findScorer(values);

  if (existing) {
    await existing.update(values);

    return {
      record: existing,
      created: false,
      updated: true,
    };
  }

  const created =
    await Scorer.create(values);

  return {
    record: created,
    created: true,
    updated: false,
  };
};



/**
 * Resolve the current season for a competition.
 */
const getCompetitionSeason = async (
  leagueId
) => {
  const payload =
    await withRetry(() =>
      requestFootballApi(
        `/competitions/${leagueId}`,
        {}
      )
    );

  const seasonData =
    payload?.currentSeason ||
    payload?.season ||
    null;

  const season =
    getApplicationSeason(
      seasonData
    );

  return {
    payload,
    season,
  };
};

/**
 * Ensure the competition exists in the
 * local Leagues table.
 */
const ensureLeague = async (
  competitionPayload,
  leagueId
) => {
  const resolvedLeagueId =
    normalizeString(
      competitionPayload?.id ??
        competitionPayload?.leagueId ??
        leagueId
    );

  if (!resolvedLeagueId) {
    return null;
  }

  const existing =
    await League.findOne({
      where: {
        leagueId:
          resolvedLeagueId,
      },
    });

  if (existing) {
    return existing;
  }

  return League.create({
    leagueId:
      resolvedLeagueId,

    name:
      normalizeString(
        competitionPayload?.name
      ),

    code:
      normalizeString(
        competitionPayload?.code
      ),

    country:
      normalizeString(
        competitionPayload?.area?.name ??
          competitionPayload?.country
      ),

    logo:
      normalizeString(
        competitionPayload?.emblem ??
          competitionPayload?.logo
      ),
  });
};

/**
 * Resolve a team from the local database.
 *
 * IMPORTANT:
 * We do NOT create a fake team here.
 *
 * The team should normally already exist because
 * teamSync runs before scorerSync.
 *
 * If it doesn't exist, teamId becomes null,
 * which is allowed by the Scorer model.
 */
const resolveTeam = async (
  item
) => {
  const apiTeamId =
    normalizeString(
      item?.team?.id ??
        item?.teamId
    );

  if (!apiTeamId) {
    return null;
  }

  const team =
    await Team.findOne({
      where: {
        teamId:
          apiTeamId,
      },
    });

  return team;
};

/**
 * Synchronize top scorers.
 *
 * @param {Array|null} leagueIds
 * Optional list of competition IDs.
 */
export const syncScorers = async (
  competitionIds = null
) => {
  const startedAt =
    Date.now();

  const stats = {
    requests: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  if (
    !isFootballApiConfigured()
  ) {
    buildLog(
      "syncScorers",
      "Football API is not configured."
    );

    return stats;
  }

  
const targetCompetitionIds =
  Array.isArray(competitionIds) &&
  competitionIds.length
    ? competitionIds
    : [];

buildLog(
  "syncScorers",
  `Starting scorer sync for ${targetCompetitionIds.length} competition(s)`,
  {
    competitionIds:
      targetCompetitionIds,
  }
);

if (!targetCompetitionIds.length) {
  buildLog(
    "syncScorers",
    "No competitions supplied for scorer sync."
  );

  return stats;
}

  for (
  const leagueId of targetCompetitionIds
) {
    try {
      /*
       * ----------------------------------------------------
       * 1. Get competition information
       * ----------------------------------------------------
       *
       * We need this to determine the current season.
       */
      const {
        payload:
          competitionPayload,
        season,
      } =
        await getCompetitionSeason(
          leagueId
        );

      stats.requests += 1;

      if (!season) {
        buildLog(
          "syncScorers",
          `No current season found for league ${leagueId}`
        );

        stats.skipped += 1;

        await sleep(250);

        continue;
      }

      /*
       * ----------------------------------------------------
       * 2. Ensure league exists
       * ----------------------------------------------------
       *
       * Scorer.competitionId has a foreign-key relationship
       * with League.leagueId.
       */
      try {
        await ensureLeague(
          competitionPayload,
          leagueId
        );
      } catch (error) {
        stats.errors += 1;

        buildLog(
          "syncScorers",
          `Failed to ensure league ${leagueId}`,
          {
            error:
              error.message,
          }
        );

        await sleep(250);

        continue;
      }

      /*
       * ----------------------------------------------------
       * 3. Request scorers
       * ----------------------------------------------------
       */
      const scorersPayload =
        await withRetry(() =>
          requestFootballApi(
            `/competitions/${leagueId}/scorers`,
            {}
          )
        );

      stats.requests += 1;

      const scorers =
        Array.isArray(
          scorersPayload?.scorers
        )
          ? scorersPayload.scorers
          : [];

      if (!scorers.length) {
        buildLog(
          "syncScorers",
          `No scorers returned for league ${leagueId}`,
          {
            season,
          }
        );

        await sleep(250);

        continue;
      }

      /*
       * ----------------------------------------------------
       * 4. Process each scorer
       * ----------------------------------------------------
       */
      for (
        const item of scorers
      ) {
        try {
          const playerId =
            normalizeString(
              item?.player?.id ??
                item?.playerId
            );

          const playerName =
            normalizeString(
              item?.player?.name ??
                item?.playerName ??
                [
                  item?.player?.firstName,
                  item?.player?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")
            );

          /*
           * A scorer without a player ID or name
           * cannot be stored safely.
           */
          if (
            !playerId ||
            !playerName
          ) {
            stats.skipped += 1;

            buildLog(
              "syncScorers",
              "Skipping scorer without player information",
              {
                leagueId,
                season,
              }
            );

            continue;
          }

          /*
           * ------------------------------------------------
           * Resolve team
           * ------------------------------------------------
           */
          const team =
            await resolveTeam(
              item
            );

          /*
           * If the API provides a team but the local
           * Teams table doesn't have it yet, we keep
           * the scorer but set teamId to NULL.
           *
           * This is allowed by your Scorer model:
           *
           * teamId: {
           *   allowNull: true
           * }
           */
          const values =
            buildScorerPayload(
              item,
              leagueId,
              season,
              team?.teamId ??
                null
            );

          /*
           * Make sure competitionId, season and
           * playerId are available.
           */
          if (
            !values.competitionId ||
            !values.season ||
            !values.playerId
          ) {
            stats.skipped += 1;

            continue;
          }

          const result =
            await upsertScorer(
              values
            );

          if (
            result.created
          ) {
            stats.created += 1;
          }

          if (
            result.updated
          ) {
            stats.updated += 1;
          }
        } catch (error) {
          stats.errors += 1;

          buildLog(
            "syncScorers",
            `Failed to sync scorer ${item?.player?.name || item?.player?.id || "unknown"}`,
            {
              leagueId,
              season,
              error:
                error.message,
            }
          );
        }
      }
    } catch (error) {
      stats.errors += 1;

      buildLog(
        "syncScorers",
        `Failed to refresh scorers for league ${leagueId}`,
        {
          error:
            error.message,
          stack:
            error.stack,
        }
      );

      /*
       * If football-data.org returns a rate-limit
       * error, withRetry should normally handle it.
       *
       * We still continue to the next league rather
       * than terminating the entire scheduler.
       */
    }

    /*
     * Small delay between competitions to reduce
     * API pressure.
     */
    await sleep(250);
  }

  buildLog(
    "syncScorers",
    "Scorer sync complete",
    {
      ...stats,
      durationMs:
        Date.now() - startedAt,
    }
  );

  return stats;
};

export default syncScorers;
