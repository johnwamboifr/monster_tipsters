// server/controllers/football/leaguesController.js

import db from "../../models/index.js";

const { League } = db;
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

export const getLeagues = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/leagues";

  try {
    const {
      search,
      country,
      code,
      limit = 500,
    } = req.query;

    const where = {};

    if (country) {
      where.country = country;
    }

    if (code) {
      where.code = code.toUpperCase();
    }

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const leagues = await League.findAll({
      where,
      attributes: [
        "leagueId",
        "name",
        "code",
        "country",
        "logo",
      ],
      order: [
        ["country", "ASC"],
        ["name", "ASC"],
      ],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      count: leagues.length,
      data: leagues,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getLeagues",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load leagues.",
    });
  }
};
