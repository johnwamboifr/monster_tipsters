// server/utils/sync/teamSync.js

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

import {
  isFootballApiConfigured,
} from "../../config/football-api.js";

const { Team } = db;

/**
 * ============================================================
 * CURRENT APPLICATION SEASON
 * ============================================================
 *
 * 2026 = 2026/27
 * 2027 = 2027/28
 *
 * Football seasons normally start around July/August.
 */
const getCurrentSeason = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  return month >= 7
    ? year
    : year - 1;
};

/**
 * ============================================================
 * BUILD TEAM PAYLOAD
 * ============================================================
 */

const buildTeamPayload = (
  item,
  leagueId
) => {
  const teamId = normalizeString(
    item?.id ??
      item?.teamId
  );

  return {
    teamId,

    leagueId: normalizeString(
      leagueId
    ),

    name: normalizeString(
      item?.name
    ),

    shortName: normalizeString(
      item?.shortName
    ),

    tla: normalizeString(
      item?.tla
    ),

    logo: normalizeString(
      item?.crest ??
        item?.logo
    ),

    venue: normalizeString(
      item?.venue
    ),

    website: normalizeString(
      item?.website
    ),

    founded:
      item?.founded != null
        ? Number(item.founded)
        : null,
  };
};

/**
 * ============================================================
 * UPSERT TEAM
 * ============================================================
 */


      const upsertTeam = async (values) => {
  if (!values.teamId) {
    return {
      record: null,
      created: false,
      updated: false,
      leagueChanged: false,
      oldLeagueId: null,
    };
  }

  const existing = await Team.findOne({
    where: {
      teamId: values.teamId,
    },
  });

  if (!existing) {
    const record = await Team.create(values);

    return {
      record,
      created: true,
      updated: false,
      leagueChanged: false,
      oldLeagueId: null,
    };
  }

  const oldLeagueId = normalizeString(
    existing.leagueId
  );

  const newLeagueId = normalizeString(
    values.leagueId
  );

  const leagueChanged =
    oldLeagueId !== newLeagueId;

  await existing.update(values);

  return {
    record: existing,
    created: false,
    updated: true,
    leagueChanged,
    oldLeagueId,
  };
};

/**
 * ============================================================
 * RESOLVE COMPETITIONS
 * ============================================================
 *
 * FOOTBALL_COMPETITIONS contains competition codes such as:
 *
 * PL
 * PD
 * BL1
 * SA
 * FL1
 *
 * football-data.org returns numeric IDs.
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
 * SYNC TEAMS
 * ============================================================
 */

export const syncTeams =
  async (
    competitionCodes = null
  ) => {
    const startedAt =
      Date.now();

    const season =
      getCurrentSeason();

    const stats = {
      requests: 0,
      competitions: 0,
      teamsReceived: 0,
      created: 0,
      updated: 0,
      leagueChanges: 0,
      skipped: 0,
      errors: 0,
    };

    if (
      !isFootballApiConfigured()
    ) {
      buildLog(
        "syncTeams",
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

      buildLog(
        "syncTeams",
        "Competitions resolved",
        {
          season,
          competitions:
            competitions.map(
              (competition) => ({
                id:
                  competition.id,

                code:
                  competition.code,

                name:
                  competition.name,
              })
            ),
        }
      );
    } catch (error) {
      stats.errors += 1;

      buildLog(
        "syncTeams",
        "Unable to resolve competitions",
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
        "syncTeams",
        "No competitions found."
      );

      return stats;
    }

    /**
     * --------------------------------------------------------
     * Process one competition at a time.
     * --------------------------------------------------------
     */

    for (
      const competition of
        competitions
    ) {
      const leagueId =
        String(
          competition.id
        );

      try {
        const payload =
          await withRetry(() =>
            requestFootballApi(
              `/competitions/${leagueId}/teams`,
              {
                season,
              }
            )
          );

        stats.requests += 1;

        const teams =
          Array.isArray(
            payload?.teams
          )
            ? payload.teams
            : [];

        stats.teamsReceived +=
          teams.length;

        buildLog(
          "syncTeams",
          `Received ${teams.length} team(s)`,
          {
            competition:
              competition.code,

            leagueId,

            season,
          }
        );

        for (
          const team of teams
        ) {
          try {
            const values =
              buildTeamPayload(
                team,
                leagueId
              );

            if (
              !values.teamId
            ) {
              stats.skipped += 1;
              continue;
            }

            const result =
              await upsertTeam(
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
              result.leagueChanged
            ) {
              stats.leagueChanges +=
                1;

              buildLog(
                "syncTeams",
                "Team league changed",
                {
                  teamId:
                    values.teamId,

                  team:
                    values.name,

                  oldLeagueId:
                    result.record
                      ?.previous(
                        "leagueId"
                      ),

                  newLeagueId:
                    values.leagueId,

                  competition:
                    competition.code,

                  season,
                }
              );
            }
          } catch (
            error
          ) {
            stats.errors += 1;

            buildLog(
              "syncTeams",
              "Failed to synchronize team",
              {
                team:
                  team?.name,

                teamId:
                  team?.id,

                leagueId,

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
          "syncTeams",
          "Competition team sync failed",
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

      /**
       * Keep requests comfortably separated.
       */
      await sleep(1000);
    }

    buildLog(
      "syncTeams",
      "Team synchronization completed",
      {
        ...stats,

        season,

        durationMs:
          Date.now() -
          startedAt,
      }
    );

    return stats;
  };

export default syncTeams;
