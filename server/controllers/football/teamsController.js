// server/controllers/football/teamsController.js

import db from "../../models/index.js";

const { Team, League } = db;
const { Op } = db.Sequelize;

const logControllerError = (endpoint, error, context = {}) => {
  console.error(`[${endpoint}]`, {
    message: error?.message,
    stack: error?.stack,
    endpoint,
    sql: error?.sql || error?.parent?.sql || null,
    ...context,
  });
};

export const getTeams = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/teams";

  try {
    const {
      league,
      search,
      country,
      limit = 500,
    } = req.query;

    const where = {};
    const leagueWhere = {};

    if (league) {
      where.leagueId = league;
    }

    if (search) {
      where[Op.or] = [
        {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          shortName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          tla: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    if (country) {
      leagueWhere.country = country;
    }

    const teams = await Team.findAll({
      where,
      include: [
        {
          model: League,
          where: Object.keys(leagueWhere).length ? leagueWhere : undefined,
          required: false,
          attributes: [
            "leagueId",
            "name",
            "country",
            "code",
            "logo",
          ],
        },
      ],
      attributes: [
        "teamId",
        "leagueId",
        "name",
        "shortName",
        "tla",
        "logo",
        "venue",
        "website",
        "founded",
      ],
      order: [
        ["name", "ASC"],
      ],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getTeams",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load teams.",
    });
  }
};
