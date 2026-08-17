
// server/controllers/football/fixturesController.js

import db from "../../models/index.js";

const { Match, League, Team, Prediction } = db;
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

export const getFixtures = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/fixtures";

  try {
    const {
      league,
      season,
      status,
      stage,
      group,
      matchday,
      date,
      limit = 100,
      search,
      team,
    } = req.query;

    const where = {};
    const searchTerm = String(search || team || "").trim();
    const normalizedStatus = status ? String(status).trim().toUpperCase() : null;

    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    if (season) {
      where.season = season;
    }

    if (stage) {
      where.stage = stage;
    }

    if (group) {
      where.group = group;
    }

    if (matchday) {
      where.matchday = Number(matchday);
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      where.kickoffTime = {
        [Op.between]: [start, end],
      };
    }

    if (league) {
      where.leagueId = league;
    }

    if (searchTerm) {
      const like = { [Op.like]: `%${searchTerm}%` };
      where[Op.or] = [
        { "$homeTeam.name$": like },
        { "$awayTeam.name$": like },
        { "$League.name$": like },
      ];
    }

    const fixtures = await Match.findAll({
      where,
      include: [
        {
          model: League,
          attributes: ["leagueId", "name", "logo"],
        },
        {
          model: Team,
          as: "homeTeam",
          attributes: ["teamId", "name", "logo"],
        },
        {
          model: Team,
          as: "awayTeam",
          attributes: ["teamId", "name", "logo"],
        },
        {
          model: Prediction,
          as: "predictions",
          attributes: ["prediction", "market", "odds", "confidence", "analysis", "result", "isPremium", "isFeatured", "publishedAt"],
        },
      ],
      order: [["kickoffTime", "ASC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getFixtures",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load fixtures.",
    });
  }
};

export const getMatchDetails = async (req, res) => {
  const endpoint = req.originalUrl;

  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      where: { matchId },
      include: [
        {
          model: League,
          attributes: ["leagueId", "name", "logo"],
        },
        {
          model: Team,
          as: "homeTeam",
          attributes: ["teamId", "name", "logo"],
        },
        {
          model: Team,
          as: "awayTeam",
          attributes: ["teamId", "name", "logo"],
        },
        {
          model: Prediction,
          as: "predictions",
        },
      ],
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found.",
      });
    }

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getMatchDetails",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load match details.",
    });
  }
};
