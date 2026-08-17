// server/controllers/football/resultsController.js

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

export const getLiveMatches = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/live";

  try {
    const { league, limit = 100 } = req.query;

    const where = {
      status: {
        [Op.in]: ["LIVE", "IN_PLAY", "PAUSED"],
      },
    };

    if (league) {
      where.leagueId = league;
    }

    const matches = await Match.findAll({
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
      ],
      order: [["kickoffTime", "ASC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getLiveMatches",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load live matches.",
    });
  }
};

export const getFinishedMatches = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/results";

  try {
    const {
      league,
      season,
      status,
      search,
      date,
      limit = 100,
    } = req.query;

    const completedStatusValues = ["FINISHED", "FT", "AET", "PEN", "COMPLETED", "ENDED", "DONE", "RESULT"];
    const where = {
      [Op.and]: [
        { status: { [Op.in]: completedStatusValues } },
      ],
    };

    if (league) {
      where[Op.and].push({ leagueId: league });
    }

    if (season) {
      where[Op.and].push({ season });
    }

    if (status) {
      const normalized = status.toUpperCase();
      where[Op.and].push({ status: normalized });
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      where.kickoffTime = {
        [Op.between]: [start, end],
      };
    }

    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [
        { "$homeTeam.name$": like },
        { "$awayTeam.name$": like },
        { "$League.name$": like },
        { "$predictions.prediction$": like },
      ];
    }

    const matches = await Match.findAll({
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
          attributes: ["prediction", "market", "result", "odds", "confidence"],
        },
      ],
      order: [["kickoffTime", "DESC"]],
      limit: Number(limit),
    });

    const payload = matches.map((match) => {
      const raw = match.toJSON ? match.toJSON() : match;
      const prediction = Array.isArray(raw.predictions) ? raw.predictions[0] : raw.predictions || null;

      return {
        ...raw,
        league: raw.League?.name || raw.league || "",
        leagueLogo: raw.League?.logo || raw.leagueLogo || "",
        homeTeam: raw.homeTeam?.name || raw.homeTeam || "",
        awayTeam: raw.awayTeam?.name || raw.awayTeam || "",
        homeTeamLogo: raw.homeTeam?.logo || raw.homeTeamLogo || "",
        awayTeamLogo: raw.awayTeam?.logo || raw.awayTeamLogo || "",
        prediction: prediction?.prediction || null,
        predictionResult: prediction?.result || raw.predictionResult || raw.result || "Pending",
        predictionMarket: prediction?.market || raw.predictionMarket || null,
        predictionOdds: prediction?.odds ?? raw.predictionOdds ?? null,
        predictionConfidence: prediction?.confidence ?? raw.predictionConfidence ?? null,
      };
    });

    console.log("Finished matches response", {
      count: payload.length,
      first: payload[0],
    });

    return res.json({
      success: true,
      count: payload.length,
      data: payload,
    });
  } catch (error) {
    logControllerError(endpoint, error, {
      operation: "getFinishedMatches",
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load finished matches.",
    });
  }
};
