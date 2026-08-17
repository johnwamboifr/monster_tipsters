import db from "../../models/index.js";

const { Scorer, League, Team } = db;
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

export const getScorers = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/scorers";

  try {
    const {
      league,
      season,
      search,
      limit = 50,
      order = "goals",
    } = req.query;

    const where = {};

    if (league) {
      where.competitionId = league;
    }

    if (season) {
      where.season = season;
    }

    if (search) {
      where.playerName = {
        [Op.like]: `%${search}%`,
      };
    }

    const validOrderFields = ["goals", "assists", "penalties", "matchesPlayed"];
    const orderField = validOrderFields.includes(order) ? order : "goals";

    const scorers = await Scorer.findAll({
      where,
      include: [
        {
          model: League,
          attributes: ["leagueId", "name", "logo"],
          required: false,
        },
        {
          model: Team,
          attributes: ["teamId", "name", "logo"],
          required: false,
        },
      ],
      order: [[orderField, "DESC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      count: scorers.length,
      data: scorers,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getScorers",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load top scorers.",
    });
  }
};
