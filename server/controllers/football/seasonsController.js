import db from "../../models/index.js";

const { Season, League } = db;
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

export const getSeasons = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/seasons";

  try {
    const { league, season, current, limit = 200 } = req.query;
    const where = {};

    if (league) where.leagueId = league;
    if (season) where.season = season;
    if (current === "true") where.isCurrent = true;

    const seasons = await Season.findAll({
      where,
      include: [{ model: League, attributes: ["leagueId", "name", "logo"] }],
      order: [["isCurrent", "DESC"], ["startDate", "DESC"], ["season", "DESC"]],
      limit: Number(limit),
    });

    return res.json({ success: true, count: seasons.length, data: seasons });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getSeasons" });
    return res.status(500).json({ success: false, message: "Unable to load seasons." });
  }
};
