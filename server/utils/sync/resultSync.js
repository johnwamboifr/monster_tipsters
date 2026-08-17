import db from "../../models/index.js";
import {
  buildLog,
  getApplicationSeason,
  normalizeDate,
  normalizeString,
  sleep,
} from "../footballSyncHelpers.js";
import {
  requestFootballApi,
  withRetry,
} from "../footballApiClient.js";
import { isFootballApiConfigured } from "../../config/football-api.js";

const { Match } = db;
const { Op } = db.Sequelize;

const TERMINAL_MATCH_STATUSES = new Set([
  "FINISHED",
  "FT",
  "AET",
  "PEN",
  "COMPLETED",
  "ENDED",
  "DONE",
  "RESULT",
  "AWARDED",
  "CANCELLED",
  "CANCELED",
  "POSTPONED",
  "SUSPENDED",
]);

const buildMatchPayload = (
  item,
  leagueId
) => ({
  matchId: normalizeString(
    item?.id ??
      item?.matchId
  ),

  leagueId: normalizeString(
    leagueId
  ),

  season: getApplicationSeason(
    item?.season
  ),

  matchday:
    item?.matchday != null
      ? Number(item.matchday)
      : null,

  stage: normalizeString(
    item?.stage
  ),

  group: normalizeString(
    item?.group
  ),

  homeTeamId: normalizeString(
    item?.homeTeam?.id ??
      item?.homeTeamId
  ),

  awayTeamId: normalizeString(
    item?.awayTeam?.id ??
      item?.awayTeamId
  ),

  kickoffTime: normalizeDate(
    item?.utcDate ??
      item?.kickoffTime
  ),

  status:
    normalizeString(
      item?.status
    ) || "SCHEDULED",

  winner: normalizeString(
    item?.score?.winner ??
      item?.winner
  ),

  duration: normalizeString(
    item?.score?.duration ??
      item?.duration
  ),

  homeScore:
    item?.score?.fullTime?.home ??
    item?.homeScore ??
    null,

  awayScore:
    item?.score?.fullTime?.away ??
    item?.awayScore ??
    null,

  halfTimeHome:
    item?.score?.halfTime?.home ??
    item?.halfTimeHome ??
    null,

  halfTimeAway:
    item?.score?.halfTime?.away ??
    item?.halfTimeAway ??
    null,

  fullTimeHome:
    item?.score?.fullTime?.home ??
    item?.fullTimeHome ??
    null,

  fullTimeAway:
    item?.score?.fullTime?.away ??
    item?.fullTimeAway ??
    null,

  extraTimeHome:
    item?.score?.extraTime?.home ??
    item?.extraTimeHome ??
    null,

  extraTimeAway:
    item?.score?.extraTime?.away ??
    item?.extraTimeAway ??
    null,

  penaltiesHome:
    item?.score?.penalties?.home ??
    item?.penaltiesHome ??
    null,

  penaltiesAway:
    item?.score?.penalties?.away ??
    item?.penaltiesAway ??
    null,

  lastSyncedAt: new Date(),
});

const isFinishedStatus = (
  status
) => {
  const normalized = String(
    status || ""
  )
    .trim()
    .toUpperCase();

  return TERMINAL_MATCH_STATUSES.has(
    normalized
  );
};

export const syncFinishedMatches =
  async () => {
    const startedAt = Date.now();

    const stats = {
      requests: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    if (!isFootballApiConfigured()) {
      buildLog(
        "syncFinishedMatches",
        "Football API is not configured."
      );

      return stats;
    }

    const candidates =
      await Match.findAll({
        where: {
          [Op.or]: [
            {
              status: {
                [Op.notIn]:
                  Array.from(
                    TERMINAL_MATCH_STATUSES
                  ),
              },
            },
            {
              status: null,
            },
          ],

          kickoffTime: {
            [Op.lte]: new Date(),
          },
        },

        order: [
          ["kickoffTime", "ASC"],
        ],
      });

    buildLog(
      "syncFinishedMatches",
      `Checking ${candidates.length} match(es) for result updates`
    );

    for (const record of candidates) {
      try {
        const payload =
          await withRetry(() =>
            requestFootballApi(
              `/matches/${record.matchId}`,
              {}
            )
          );

        stats.requests += 1;

        const item =
          payload?.match ||
          payload;

        if (
          !item?.id &&
          !item?.matchId
        ) {
          stats.skipped += 1;
          continue;
        }

        const values =
          buildMatchPayload(
            item,
            record.leagueId
          );

        if (!values.matchId) {
          stats.skipped += 1;
          continue;
        }

        const existing =
          await Match.findOne({
            where: {
              matchId:
                values.matchId,
            },
          });

        if (existing) {
          await existing.update(
            values
          );

          stats.updated += 1;
        } else {
          await Match.create(
            values
          );

          stats.created += 1;
        }

        /*
         * Prediction evaluation is intentionally
         * handled by predictionEvaluator.js.
         */
        if (
          isFinishedStatus(
            values.status
          )
        ) {
          try {
            const {
              evaluatePredictionResults,
            } = await import(
              "./predictionEvaluator.js"
            );

            await evaluatePredictionResults(
              values.matchId
            );
          } catch (error) {
            stats.errors += 1;

            buildLog(
              "syncFinishedMatches",
              `Failed to evaluate predictions for ${values.matchId}`,
              {
                error:
                  error.message,
              },
            );
          }
        }
      } catch (error) {
        stats.errors += 1;

        buildLog(
          "syncFinishedMatches",
          `Failed to sync finished match ${record.matchId}`,
          {
            error: error.message,
          }
        );
      }

      await sleep(250);
    }

    buildLog(
      "syncFinishedMatches",
      "Finished match sync complete",
      {
        ...stats,
        durationMs:
          Date.now() - startedAt,
      }
    );

    return stats;
  };

export default syncFinishedMatches;
