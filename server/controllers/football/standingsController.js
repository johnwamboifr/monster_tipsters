// server/controllers/football/standingsController.js

import db from "../../models/index.js";
import { canonicalizeSeason } from "../../utils/footballSyncHelpers.js";

const { Standing, League, Team, Sequelize } = db;

const logControllerError = (endpoint, error, context = {}) => {
  console.error(`[${endpoint}]`, {
    message: error?.message,
    stack: error?.stack,
    endpoint,
    sql: error?.sql || error?.parent?.sql || null,
    ...context,
  });
};

export const getStandings = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/standings";

  try {
    const {
      league,
      season,
      group,
      limit = 500,
    } = req.query;

    const leagueIdParam = req.params?.leagueId || league;
    const parsedLimit = Number(limit) || 500;
    const where = {};
    const normalizedSeason = canonicalizeSeason(season);

    if (leagueIdParam) {
      where.leagueId = leagueIdParam;
    }

    if (normalizedSeason) {
      where[Sequelize.Op.or] = [
        { season: normalizedSeason },
        { season: season },
      ];
    }

    if (group) {
      where.group = group;
    }

    if (req.query.stage) {
      where.stage = req.query.stage;
    }

    const standings = await Standing.findAll({
      where,
      include: [
        {
          model: League,
          attributes: ["leagueId", "name", "logo"],
        },
        {
          model: Team,
          attributes: [
            "teamId",
            "name",
            "shortName",
            "tla",
            "logo",
          ],
        },
      ],
      order: [
        ["leagueId", "ASC"],
        ["group", "ASC"],
        ["position", "ASC"],
      ],
      limit: Math.min(parsedLimit, 500),
    });

    const deduped = [];
    const seen = new Set();
    for (const standing of standings) {
      const key = [standing.leagueId, standing.teamId, standing.season, standing.stage, standing.group].join("::");
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(standing);
      }
    }

    return res.json({
      success: true,
      count: deduped.length,
      data: deduped,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getStandings",
    });

    const isDevelopment = process.env.NODE_ENV !== "production";

    return res.status(500).json({
      success: false,
      message: isDevelopment ? error.message : "Unable to load standings.",
      error: isDevelopment ? error.message : undefined,
    });
  }
};
