// server/controllers/football/predictionController.js

import db from "../../models/index.js";

const { Prediction, Match, League, Team } = db;
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

const mapPrediction = (prediction) => {
  const match = prediction?.match || {};
  const league = match.League || {};
  const homeTeam = match.homeTeam || {};
  const awayTeam = match.awayTeam || {};

  return {
    id: prediction.id,
    fixtureId: prediction.matchId,
    matchId: prediction.matchId,
    prediction: prediction.prediction,
    market: prediction.market,
    odds: prediction.odds,
    confidence: prediction.confidence,
    analysis: prediction.analysis,
    result: prediction.result || "pending",
    isPremium: Boolean(prediction.isPremium),
    isFeatured: Boolean(prediction.isFeatured),
    isPublished: Boolean(prediction.publishedAt || prediction.isFeatured),
    publishedAt: prediction.publishedAt,
    tipsType: prediction.tipsType || "free",
    league: league.name || "",
    leagueLogo: league.logo || "",
    homeTeam: homeTeam.name || "",
    awayTeam: awayTeam.name || "",
    homeTeamLogo: homeTeam.logo || "",
    awayTeamLogo: awayTeam.logo || "",
    kickoffTime: match.kickoffTime,
    status: match.status || "",
    match: `${homeTeam.name || ""} vs ${awayTeam.name || ""}`.trim(),
  };
};

const basePredictionQuery = (extraWhere = {}) => ({
  where: extraWhere,
  include: [
    {
      model: Match,
      as: "match",
      include: [
        { model: League, attributes: ["name", "logo"] },
        { model: Team, as: "homeTeam", attributes: ["name", "logo"] },
        { model: Team, as: "awayTeam", attributes: ["name", "logo"] },
      ],
    },
  ],
  order: [["publishedAt", "DESC"], ["createdAt", "DESC"]],
});

export const getFeaturedPredictions = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/predictions/featured";

  try {
    const predictions = await Prediction.findAll(basePredictionQuery({ isFeatured: true }));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getFeaturedPredictions" });
    return res.status(500).json({ success: false, message: "Unable to load featured predictions." });
  }
};

export const getFreePredictions = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/predictions/free";

  try {
    const predictions = await Prediction.findAll(basePredictionQuery({
      isPremium: false,
      publishedAt: { [Op.not]: null },
    }));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getFreePredictions" });
    return res.status(500).json({ success: false, message: "Unable to load free predictions." });
  }
};

export const getPremiumPredictions = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/predictions/premium";

  try {
    const predictions = await Prediction.findAll(basePredictionQuery({
      isPremium: true,
      publishedAt: { [Op.not]: null },
    }));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getPremiumPredictions" });
    return res.status(500).json({ success: false, message: "Unable to load premium predictions." });
  }
};

export const getPredictionByMatch = async (req, res) => {
  const { matchId } = req.params;
  const endpoint = req.originalUrl || `/api/football/predictions/${matchId}`;

  try {
    const predictions = await Prediction.findAll(basePredictionQuery({ matchId }));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getPredictionByMatch" });
    return res.status(500).json({ success: false, message: "Unable to load prediction details." });
  }
};

export const getCompletedPredictions = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/predictions/completed";

  try {
    const predictions = await Prediction.findAll(basePredictionQuery({
      result: { [Op.in]: ["won", "lost", "void"] },
    }));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getCompletedPredictions" });
    return res.status(500).json({ success: false, message: "Unable to load completed predictions." });
  }
};

export const getPredictions = async (req, res) => {
  const { featured, premium, completed } = req.query;
  const endpoint = req.originalUrl || "/api/football/predictions";

  try {
    const where = {};

    if (featured === "true") where.isFeatured = true;
    if (premium === "true") where.isPremium = true;
    if (completed === "true") where.result = { [Op.in]: ["won", "lost", "void"] };

    const predictions = await Prediction.findAll(basePredictionQuery(where));

    return res.json({
      success: true,
      count: predictions.length,
      data: predictions.map(mapPrediction),
    });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "getPredictions" });
    return res.status(500).json({ success: false, message: "Unable to load predictions." });
  }
};

export const createPrediction = async (req, res) => {
  const endpoint = req.originalUrl || "/api/football/predictions";

  try {
    const {
      fixtureId,
      matchId,
      prediction,
      market,
      odds,
      confidence,
      analysis,
      isPremium = false,
      isFeatured = false,
      publishedAt = null,
      result = "pending",
      tipsType = "free",
    } = req.body;

    const targetMatchId = fixtureId || matchId;
    if (!targetMatchId) {
      return res.status(400).json({ success: false, message: "matchId or fixtureId is required." });
    }

    const existing = await Prediction.findOne({ where: { matchId: targetMatchId } });
    if (existing) {
      return res.status(409).json({ success: false, message: "A prediction already exists for this match." });
    }

    const created = await Prediction.create({
      matchId: targetMatchId,
      prediction,
      market,
      odds,
      confidence,
      analysis,
      isPremium,
      isFeatured,
      publishedAt,
      result,
      tipsType,
    });

    const baseQuery = basePredictionQuery();
    const payload = await Prediction.findOne({
      where: { id: created.id },
      include: baseQuery.include,
    });

    return res.status(201).json({ success: true, data: mapPrediction(payload) });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "createPrediction" });
    return res.status(500).json({ success: false, message: "Unable to create prediction." });
  }
};

export const updatePredictionByMatch = async (req, res) => {
  const { matchId } = req.params;
  const endpoint = req.originalUrl || `/api/football/predictions/${matchId}`;

  try {
    const updatePayload = {
      prediction: req.body.prediction,
      market: req.body.market,
      odds: req.body.odds,
      confidence: req.body.confidence,
      analysis: req.body.analysis,
      isPremium: req.body.isPremium,
      isFeatured: req.body.isFeatured,
      publishedAt: req.body.publishedAt,
      result: req.body.result,
      tipsType: req.body.tipsType,
    };

    const existing = await Prediction.findOne({ where: { matchId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Prediction not found." });
    }

    await existing.update(updatePayload);

    const payload = await Prediction.findOne({
      where: { id: existing.id },
      ...basePredictionQuery().include ? { include: basePredictionQuery().include } : {},
      order: undefined,
    });

    return res.json({ success: true, data: mapPrediction(payload) });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "updatePredictionByMatch" });
    return res.status(500).json({ success: false, message: "Unable to update prediction." });
  }
};

export const patchPredictionByMatch = async (req, res) => {
  const { matchId } = req.params;
  const endpoint = req.originalUrl || `/api/football/predictions/${matchId}`;

  try {
    const existing = await Prediction.findOne({ where: { matchId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Prediction not found." });
    }

    await existing.update(req.body);

    const payload = await Prediction.findOne({
      where: { id: existing.id },
      ...basePredictionQuery().include ? { include: basePredictionQuery().include } : {},
      order: undefined,
    });

    return res.json({ success: true, data: mapPrediction(payload) });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "patchPredictionByMatch" });
    return res.status(500).json({ success: false, message: "Unable to patch prediction." });
  }
};

export const deletePredictionByMatch = async (req, res) => {
  const { matchId } = req.params;
  const endpoint = req.originalUrl || `/api/football/predictions/${matchId}`;

  try {
    const existing = await Prediction.findOne({ where: { matchId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Prediction not found." });
    }

    await existing.destroy();

    return res.json({ success: true, message: "Prediction deleted successfully." });
  } catch (error) {
    logControllerError(endpoint, error, { operation: "deletePredictionByMatch" });
    return res.status(500).json({ success: false, message: "Unable to delete prediction." });
  }
};
