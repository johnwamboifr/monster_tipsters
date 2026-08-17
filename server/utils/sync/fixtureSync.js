// server/utils/sync/fixtureSync.js

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

import {
  isFootballApiConfigured,
} from "../../config/football-api.js";

const { Match } = db;

/**
 * ============================================================
 * COMPETITION SEASONS
 * ============================================================
 */

const getCompetitionSeasons = async (leagueId) => {
  const competitionPayload = await withRetry(() =>
    requestFootballApi(`/competitions/${leagueId}`, {})
  );

  const seasons = Array.isArray(competitionPayload?.seasons)
    ? competitionPayload.seasons
    : [];

  const candidateSeasons = [
    ...(seasons.length
      ? seasons.map((season) => getApplicationSeason(season))
      : []),
    getApplicationSeason(competitionPayload?.currentSeason || competitionPayload?.season),
  ];

  return [...new Set(candidateSeasons.filter(Boolean))];
};

const isTerminalMatchStatus = (status) => {
  const normalized = String(status || "").trim().toUpperCase();

  return [
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
  ].includes(normalized);
};

/**
 * ============================================================
 * BUILD MATCH PAYLOAD
 * ============================================================
 */

const buildMatchPayload = (
  item,
  leagueId
) => {
  const matchId =
    normalizeString(
      item?.id ??
        item?.matchId
    );

  return {
    matchId,

    leagueId:
      normalizeString(
        leagueId
      ),

    season:
      getApplicationSeason(
        item?.season
      ),

    matchday:
      item?.matchday != null
        ? Number(
            item.matchday
          )
        : null,

    stage:
      normalizeString(
        item?.stage
      ),

    group:
      normalizeString(
        item?.group
      ),

    homeTeamId:
      normalizeString(
        item?.homeTeam?.id ??
          item?.homeTeamId
      ),

    awayTeamId:
      normalizeString(
        item?.awayTeam?.id ??
          item?.awayTeamId
      ),

    kickoffTime:
      normalizeDate(
        item?.utcDate ??
          item?.kickoffTime
      ),

    status:
      normalizeString(
        item?.status
      ) ||
      "SCHEDULED",

    winner:
      normalizeString(
        item?.score?.winner ??
          item?.winner
      ),

    duration:
      normalizeString(
        item?.score?.duration ??
          item?.duration
      ),

    homeScore:
      item?.score?.fullTime
        ?.home ??
      item?.homeScore ??
      null,

    awayScore:
      item?.score?.fullTime
        ?.away ??
      item?.awayScore ??
      null,

    halfTimeHome:
      item?.score?.halfTime
        ?.home ??
      item?.halfTimeHome ??
      null,

    halfTimeAway:
      item?.score?.halfTime
        ?.away ??
      item?.halfTimeAway ??
      null,

    fullTimeHome:
      item?.score?.fullTime
        ?.home ??
      item?.fullTimeHome ??
      null,

    fullTimeAway:
      item?.score?.fullTime
        ?.away ??
      item?.fullTimeAway ??
      null,

    extraTimeHome:
      item?.score?.extraTime
        ?.home ??
      item?.extraTimeHome ??
      null,

    extraTimeAway:
      item?.score?.extraTime
        ?.away ??
      item?.extraTimeAway ??
      null,

    penaltiesHome:
      item?.score?.penalties
        ?.home ??
      item?.penaltiesHome ??
      null,

    penaltiesAway:
      item?.score?.penalties
        ?.away ??
      item?.penaltiesAway ??
      null,

    lastSyncedAt:
      new Date(),
  };
};

/**
 * ============================================================
 * UPSERT MATCH
 * ============================================================
 */

const upsertMatch = async (
  values
) => {
  if (!values.matchId) {
    return {
      record: null,
      created: false,
      updated: false,
    };
  }

  const existing =
    await Match.findOne({
      where: {
        matchId:
          values.matchId,
      },
    });

  if (!existing) {
    const record =
      await Match.create(
        values
      );

    return {
      record,
      created: true,
      updated: false,
    };
  }

  await existing.update(
    values
  );

  return {
    record: existing,
    created: false,
    updated: true,
  };
};

/**
 * ============================================================
 * RESOLVE COMPETITIONS
 * ============================================================
 */

const resolveCompetitionIds =
  async (
    competitionCodes
  ) => {
    const payload =
      await withRetry(() =>
        requestFootballApi(
          "/competitions",
          {}
        )
      );

    const competitions =
      Array.isArray(
        payload?.competitions
      )
        ? payload.competitions
        : [];

    const allowedCodes =
      Array.isArray(
        competitionCodes
      ) &&
      competitionCodes.length
        ? competitionCodes.map(
            (code) =>
              String(code)
                .trim()
                .toUpperCase()
          )
        : null;

    return competitions
      .filter(
        (competition) => {
          if (
            !competition?.id
          ) {
            return false;
          }

          if (
            !allowedCodes
          ) {
            return true;
          }

          return allowedCodes.includes(
            String(
              competition.code ||
                ""
            )
              .trim()
              .toUpperCase()
          );
        }
      )
      .map(
        (competition) => ({
          id:
            competition.id,

          code:
            normalizeString(
              competition.code
            ),

          name:
            normalizeString(
              competition.name
            ),

          currentSeason:
            competition.currentSeason ||
            null,
        })
      );
  };

/**
 * ============================================================
 * SYNC FIXTURES
 * ============================================================
 */

export const syncFixtures =
  async (
    competitionCodes = null
  ) => {
    const startedAt =
      Date.now();

    const stats = {
      requests: 0,
      competitions: 0,
      matchesReceived: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    if (
      !isFootballApiConfigured()
    ) {
      buildLog(
        "syncFixtures",
        "Football API is not configured."
      );

      return stats;
    }

    let competitions;

    try {
      competitions =
        await resolveCompetitionIds(
          competitionCodes
        );

      stats.requests += 1;

      stats.competitions =
        competitions.length;
    } catch (error) {
      stats.errors += 1;

      buildLog(
        "syncFixtures",
        "Failed to resolve competitions",
        {
          error:
            error?.message,
        }
      );

      return stats;
    }

    if (
      !competitions.length
    ) {
      buildLog(
        "syncFixtures",
        "No competitions found."
      );

      return stats;
    }

    for (
      const competition of
        competitions
    ) {
      const leagueId =
        String(
          competition.id
        );

      let seasons = [];

      try {
        seasons =
          await getCompetitionSeasons(
            leagueId
          );
      } catch (error) {
        stats.errors += 1;

        buildLog(
          "syncFixtures",
          "Failed to resolve competition seasons",
          {
            competition:
              competition.code,

            leagueId,

            error:
              error?.message,
          }
        );

        seasons = [];
      }

      if (
        !seasons.length
      ) {
        const fallbackSeason =
          getApplicationSeason(
            competition.currentSeason
          );

        if (fallbackSeason) {
          seasons = [fallbackSeason];
        }
      }

      if (
        !seasons.length
      ) {
        buildLog(
          "syncFixtures",
          `Skipping fixture sync for ${competition.code} because no seasons were resolved`,
          {
            leagueId,
          }
        );

        continue;
      }

      for (
        const season of seasons
      ) {
        try {
          const payload =
            await withRetry(() =>
              requestFootballApi(
                `/competitions/${leagueId}/matches`,
                {
                  season,
                }
              )
            );

          stats.requests += 1;

          const matches =
            Array.isArray(
              payload?.matches
            )
              ? payload.matches
              : [];

          stats.matchesReceived +=
            matches.length;

          buildLog(
            "syncFixtures",
            `Received ${matches.length} match(es)`,
            {
              competition:
                competition.code,

              leagueId,

              season,
            }
          );

          for (
            const item of matches
          ) {
            try {
              const values =
                buildMatchPayload(
                  item,
                  leagueId
                );

              if (
                !values.matchId
              ) {
                stats.skipped += 1;
                continue;
              }

              if (
                !values.homeTeamId ||
                !values.awayTeamId
              ) {
                stats.skipped += 1;

                buildLog(
                  "syncFixtures",
                  "Skipping match because a team is missing",
                  {
                    matchId:
                      values.matchId,

                    homeTeamId:
                      values.homeTeamId,

                    awayTeamId:
                      values.awayTeamId,
                  }
                );

                continue;
              }

              if (
                !values.season
              ) {
                stats.skipped += 1;
                continue;
              }

              const result =
                await upsertMatch(
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

              if (
                isTerminalMatchStatus(
                  values.status
                )
              ) {
                const {
                  evaluatePredictionResults,
                } = await import(
                  "./predictionEvaluator.js"
                );

                await evaluatePredictionResults(
                  values.matchId
                );
              }
            } catch (
              error
            ) {
              stats.errors += 1;

              buildLog(
                "syncFixtures",
                "Failed to synchronize match",
                {
                  matchId:
                    item?.id,

                  competition:
                    competition.code,

                  error:
                    error?.message,
                }
              );
            }
          }
        } catch (
          error
        ) {
          stats.errors += 1;

          buildLog(
            "syncFixtures",
            "Competition fixture sync failed",
            {
              competition:
                competition.code,

              leagueId,

              season,

              error:
                error?.message,
            }
          );
        }

        await sleep(1000);
      }
    }

    buildLog(
      "syncFixtures",
      "Fixture synchronization completed",
      {
        ...stats,

        durationMs:
          Date.now() -
          startedAt,
      }
    );

    return stats;
  };

export default syncFixtures;
