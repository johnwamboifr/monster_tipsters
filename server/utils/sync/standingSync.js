import db from "../../models/index.js";
import {
  buildLog,
  canonicalizeSeason,
  getApplicationSeason,
  normalizeString,
  sleep,
} from "../footballSyncHelpers.js";
import { requestFootballApi, withRetry } from "../footballApiClient.js";
import { isFootballApiConfigured } from "../../config/football-api.js";
const { League, Team, Standing, Season } = db;

//const { League, Team, Standing, Season, Match } = db;
const { Op } = db.Sequelize;

/**
 * Build league database payload.
 *
 * leagueId is the football-data.org competition ID.
 */
const buildLeaguePayload = (item) => ({
  leagueId: normalizeString(
    item?.id ?? item?.leagueId
  ),

  name: normalizeString(item?.name),

  code: normalizeString(item?.code),

  country: normalizeString(
    item?.area?.name || item?.country
  ),

  logo: normalizeString(
    item?.emblem || item?.logo
  ),
});

/**
 * Build team database payload.
 */
const buildTeamPayload = (item, leagueId) => ({
  teamId: normalizeString(
    item?.id ?? item?.teamId
  ),

  leagueId: normalizeString(leagueId),

  name: normalizeString(item?.name),

  shortName: normalizeString(
    item?.shortName
  ),

  tla: normalizeString(item?.tla),

  logo: normalizeString(
    item?.crest || item?.logo
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
});

/**
 * Convert football-data.org season object
 * into our application season value.
 *
 * IMPORTANT:
 *
 * football-data.org provides:
 *
 * season.id        -> internal provider season ID
 * season.startDate -> beginning of football season
 *
 * Our database stores:
 *
 * season = 2026
 *
 * for the 2026/27 season.
 */

/**
 * Build standing payload.
 */
const buildStandingPayload = (
  row,
  leagueId,
  season,
  stage,
  groupName
) => ({
  leagueId: normalizeString(
    leagueId
  ),

  teamId: normalizeString(
    row?.team?.id ??
      row?.teamId
  ),

  position:
    row?.position != null
      ? Number(row.position)
      : null,

  playedGames:
    row?.playedGames != null
      ? Number(row.playedGames)
      : null,

  won:
    row?.won != null
      ? Number(row.won)
      : null,

  draw:
    row?.draw != null
      ? Number(row.draw)
      : null,

  lost:
    row?.lost != null
      ? Number(row.lost)
      : null,

  points:
    row?.points != null
      ? Number(row.points)
      : null,

  goalsFor:
    row?.goalsFor != null
      ? Number(row.goalsFor)
      : null,

  goalsAgainst:
    row?.goalsAgainst != null
      ? Number(row.goalsAgainst)
      : null,

  goalDifference:
    row?.goalDifference != null
      ? Number(row.goalDifference)
      : null,

  season: canonicalizeSeason(
    season
  ),

  stage: normalizeString(
    stage
  ),

  // Normalize null/empty groups to empty string to make uniqueness checks reliable
  group: normalizeString(groupName) || "",

  form: normalizeString(
    row?.form
  ),
});

/**
 * Build season payload.
 *
 * IMPORTANT:
 *
 * season is the football season text used by the application.
 *
 * Example:
 *
 * 2026/27
 */
const buildSeasonPayload = (
  item,
  leagueId,
  season
) => ({
  leagueId: normalizeString(
    leagueId
  ),

  season: canonicalizeSeason(
    season
  ),

  startDate:
    item?.startDate
      ? new Date(item.startDate)
      : null,

  endDate:
    item?.endDate
      ? new Date(item.endDate)
      : null,

  currentMatchday:
    item?.currentMatchday != null
      ? Number(item.currentMatchday)
      : null,

  winner: normalizeString(
    item?.winner?.name ??
      item?.winner
  ),

  isCurrent: Boolean(
    item?.current
  ),
});

/**
 * Upsert league.
 */
const upsertLeague = async (
  values
) => {
  if (!values.leagueId) {
    return null;
  }

  const existing =
    await League.findOne({
      where: {
        leagueId:
          values.leagueId,
      },
    });

  if (existing) {
    await existing.update(
      values
    );

    return existing;
  }

  return League.create(values);
};

/**
 * Upsert team.
 */
const upsertTeam = async (
  values
) => {
  if (!values.teamId) {
    return null;
  }

  const existing =
    await Team.findOne({
      where: {
        teamId:
          values.teamId,
      },
    });

  if (existing) {
    await existing.update(
      values
    );

    return existing;
  }

  return Team.create(values);
};

/**
 * Upsert standing.
 */
const upsertStanding = async (
  values
) => {
  if (
    !values.leagueId ||
    !values.teamId ||
    !values.season
  ) {
    return null;
  }

  const existing =
    await Standing.findOne({
      where: {
        leagueId:
          values.leagueId,

        teamId:
          values.teamId,

        season:
          values.season,

        stage:
          values.stage,

        group:
          values.group,
      },
    });

  if (!existing) {
    const legacyMatch = await Standing.findOne({
      where: {
        leagueId: values.leagueId,
        teamId: values.teamId,
        season: { [Op.or]: [canonicalizeSeason(values.season), values.season, null] },
        stage: values.stage,
        group: values.group,
      },
    });

    if (legacyMatch) {
      await legacyMatch.update(values);
      return legacyMatch;
    }
  }

  if (existing) {
    await existing.update(
      values
    );

    return existing;
  }

  return Standing.create(
    values
  );
};

/**
 * Upsert season.
 */
const upsertSeason = async (
  values
) => {
  if (
    !values.leagueId ||
    !values.season
  ) {
    return null;
  }

  const existing =
    await Season.findOne({
      where: {
        leagueId:
          values.leagueId,

        season:
          values.season,
      },
    });

  if (existing) {
    await existing.update(
      values
    );

    return existing;
  }

  return Season.create(
    values
  );
};

/**
 * Find leagues that have upcoming fixtures.
 */
const resolveCompetitionIds = async (
  competitionCodes
) => {
  const payload = await withRetry(() =>
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
    .filter((competition) => {
      if (!competition?.id) {
        return false;
      }

      if (!allowedCodes) {
        return true;
      }

      return allowedCodes.includes(
        String(
          competition.code || ""
        )
          .trim()
          .toUpperCase()
      );
    })
    .map((competition) => ({
      id: competition.id,
      code: normalizeString(
        competition.code
      ),
      name: normalizeString(
        competition.name
      ),
      currentSeason:
        competition.currentSeason ||
        competition.season ||
        null,
    }));
};

const resolveCompetitionSeasons = async (
  leagueId,
  fallbackSeason = null
) => {
  const competitionPayload =
    await withRetry(() =>
      requestFootballApi(
        `/competitions/${leagueId}`,
        {}
      )
    );

  const seasons = Array.isArray(
    competitionPayload?.seasons
  )
    ? competitionPayload.seasons
    : [];

  const candidates = [
    ...seasons.map((season) =>
      getApplicationSeason(season)
    ),
    getApplicationSeason(
      competitionPayload?.currentSeason ||
        competitionPayload?.season ||
        fallbackSeason
    ),
  ];

  return [...new Set(candidates.filter(Boolean))];
};

/**
 * Synchronize standings and current seasons.
 */
export const syncStandings =
  async (
    competitionCodes = null
    
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
        "syncStandings",
        "Football API is not configured."
      );

      return stats;
    }

    const competitions =
  await resolveCompetitionIds(
    competitionCodes
  );

stats.requests += 1;

buildLog(
  "syncStandings",
  `Starting standings sync for ${competitions.length} competition(s)`,
  {
    competitionCodes,
    competitions,
  }
);

if (!competitions.length) {
  buildLog(
    "syncStandings",
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
      try {
        const competitionPayload =
          await withRetry(
            () =>
              requestFootballApi(
                `/competitions/${leagueId}`,
                {}
              )
          );

        stats.requests += 1;

        const leagueValues =
          buildLeaguePayload(
            competitionPayload
          );

        if (
          leagueValues.leagueId
        ) {
          await upsertLeague(
            leagueValues
          );
        }

        const seasonOptions =
          await resolveCompetitionSeasons(
            leagueId,
            competition.currentSeason
          );

        if (!seasonOptions.length) {
          buildLog(
            "syncStandings",
            `No valid seasons found for league ${leagueId}`,
            {
              competition:
                competition.code,
            }
          );

          continue;
        }

        const teamsPayload =
          await withRetry(
            () =>
              requestFootballApi(
                `/competitions/${leagueId}/teams`,
                {}
              )
          );

        stats.requests += 1;

        const teams =
          Array.isArray(
            teamsPayload?.teams
          )
            ? teamsPayload.teams
            : [];

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

            const existing =
              await Team.findOne({
                where: {
                  teamId:
                    values.teamId,
                },
              });

            if (existing) {
              await existing.update(
                values
              );

              stats.updated += 1;
            } else {
              await Team.create(
                values
              );

              stats.created += 1;
            }
          } catch (
            error
          ) {
            stats.errors += 1;

            buildLog(
              "syncStandings",
              `Failed to sync team ${team?.name || "unknown"}`,
              {
                leagueId,
                error:
                  error.message,
              }
            );
          }
        }

        for (
          const season of
          seasonOptions
        ) {
          try {
            const standingsPayload =
              await withRetry(
                () =>
                  requestFootballApi(
                    `/competitions/${leagueId}/standings`,
                    {
                      season,
                    }
                  )
              );

            stats.requests += 1;

            const standings =
              Array.isArray(
                standingsPayload?.standings
              )
                ? standingsPayload.standings
                : [];

            if (
              !standings.length
            ) {
              buildLog(
                "syncStandings",
                `No standings returned for league ${leagueId} in season ${season}`,
                {
                  season,
                }
              );

              continue;
            }

            const seasonData =
              competitionPayload?.seasons?.find(
                (item) =>
                  getApplicationSeason(item) === season
              ) ||
              competitionPayload?.currentSeason ||
              competitionPayload?.season ||
              null;

            const seasonValues =
              seasonData &&
              buildSeasonPayload(
                seasonData,
                leagueId,
                season
              );

            if (
              seasonValues
            ) {
              const existingSeason =
                await Season.findOne({
                  where: {
                    leagueId,
                    season,
                  },
                });

              if (existingSeason) {
                await existingSeason.update(
                  seasonValues
                );
              } else {
                await Season.create(
                  seasonValues
                );
              }
            }

            try {
              const dupQuery = `
                SELECT leagueId, teamId, COALESCE(season, '') AS season, COALESCE(stage, 'overall') AS stage, COALESCE(\`group\`, 'overall') AS \`group\`, MIN(id) AS keepId, COUNT(*) AS cnt
                FROM \`Standings\`
                WHERE leagueId = ? AND season = ?
                GROUP BY leagueId, teamId, COALESCE(season, ''), COALESCE(stage, 'overall'), COALESCE(\`group\`, 'overall')
                HAVING COUNT(*) > 1
              `;

              const [dups] = await Standing.sequelize.query(dupQuery, { replacements: [leagueId, season] });

              for (const dup of dups) {
                await Standing.sequelize.query(`
                  DELETE FROM \`Standings\`
                  WHERE leagueId = ?
                    AND teamId = ?
                    AND COALESCE(season, '') = ?
                    AND COALESCE(stage, 'overall') = ?
                    AND COALESCE(\`group\`, 'overall') = ?
                    AND id != ?
                `, {
                  replacements: [dup.leagueId, dup.teamId, dup.season, dup.stage, dup.group, dup.keepId],
                });
              }
            } catch (dedupeError) {
              buildLog("syncStandings", `Failed to dedupe standings for league ${leagueId} in season ${season}`, { error: dedupeError.message });
            }

            for (
              const table of
              standings
            ) {
              const rows =
                Array.isArray(
                  table?.table
                )
                  ? table.table
                  : [];

              const stage =
                normalizeString(
                  table?.stage
                );

              const groupName =
                normalizeString(
                  table?.group
                );

              for (
                const row of
                rows
              ) {
                try {
                  const values =
                    buildStandingPayload(
                      row,
                      leagueId,
                      season,
                      stage,
                      groupName
                    );

                  if (
                    !values.teamId
                  ) {
                    stats.skipped +=
                      1;

                    continue;
                  }

                  try {
                    const foundTeam = await Team.findOne({ where: { teamId: values.teamId } });
                    if (!foundTeam && row?.team) {
                      const teamValues = buildTeamPayload(row.team, leagueId);
                      await upsertTeam(teamValues);
                    }
                  } catch (teamError) {
                    buildLog("syncStandings", `Failed to ensure team exists for ${values.teamId}`, { error: teamError.message });
                  }

                  const existing =
                    await Standing.findOne({
                      where: {
                        leagueId:
                          values.leagueId,

                        teamId:
                          values.teamId,

                        season:
                          values.season,

                        stage:
                          values.stage,

                        group:
                          values.group,
                      },
                    });

                  if (
                    existing
                  ) {
                    await existing.update(
                      values
                    );

                    stats.updated +=
                      1;
                  } else {
                    await Standing.create(
                      values
                    );

                    stats.created +=
                      1;
                  }
                } catch (
                  error
                ) {
                  stats.errors +=
                    1;

                  buildLog(
                    "syncStandings",
                    `Failed to sync standing for team ${row?.team?.name || row?.team?.id || "unknown"}`,
                    {
                      leagueId,
                      season,
                      error:
                        error.message,
                    }
                  );
                }
              }
            }
          } catch (
            error
          ) {
            stats.errors += 1;

            buildLog(
              "syncStandings",
              `Failed to refresh standings for league ${leagueId} in season ${season}`,
              {
                error:
                  error.message,
              }
            );
          }
        }
      } catch (
        error
      ) {
        stats.errors += 1;

        buildLog(
          "syncStandings",
          `Failed to refresh standings for league ${leagueId}`,
          {
            error:
              error.message,
          }
        );
      }

      await sleep(250);
    }

    buildLog(
      "syncStandings",
      "Standings sync complete",
      {
        ...stats,
        durationMs:
          Date.now() -
          startedAt,
      }
    );

    return stats;
  };

export default syncStandings;
