import db from "../models/index.js";

const { Tips } = db;

// ============================================================
// VALID TIP TYPES
// ============================================================

const VALID_TIP_TYPES = ["free", "bronze", "silver", "gold"];

const normalizeTipType = (value) => {
  const raw = String(value ?? "").trim().toLowerCase();

  if (VALID_TIP_TYPES.includes(raw)) {
    return raw;
  }

  return "free";
};

// ============================================================
// VALID SOURCE
// ============================================================

const normalizeSource = (value) => {
  const raw = String(value ?? "").trim().toLowerCase();

  return raw === "api" ? "api" : "manual";
};

// ============================================================
// CREATE TIP
// ============================================================

export const createTips = async (req, res) => {
  try {
    const {
      league,
      date,
      time,
      match,

      source,

      market,
      prediction,
      odds,
      confidence,
      analysis,

      tipsType,

      homeScore,
      awayScore,

      halfTimeHomeScore,
      halfTimeAwayScore,

      homeCorners,
      awayCorners,

      homeBookings,
      awayBookings,

      isWon,
      isLost,
      isRefunded,
    } = req.body;

    const normalizedTipsType = normalizeTipType(tipsType);
    const normalizedSource = normalizeSource(source);

    // --------------------------------------------------------
    // Validate confidence if supplied
    // --------------------------------------------------------

    if (
      confidence !== undefined &&
      confidence !== null &&
      confidence !== ""
    ) {
      const confidenceNumber = Number(confidence);

      if (
        !Number.isFinite(confidenceNumber) ||
        confidenceNumber < 0 ||
        confidenceNumber > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Confidence must be between 0 and 100.",
        });
      }
    }

    // --------------------------------------------------------
    // Validate odds if supplied
    // --------------------------------------------------------

    if (odds !== undefined && odds !== null && odds !== "") {
      const oddsNumber = Number(odds);

      if (!Number.isFinite(oddsNumber) || oddsNumber <= 0) {
        return res.status(400).json({
          success: false,
          message: "Odds must be a positive number.",
        });
      }
    }

    // --------------------------------------------------------
    // Validate result state
    // --------------------------------------------------------

    const resultFlags = [
      Boolean(isWon),
      Boolean(isLost),
      Boolean(isRefunded),
    ].filter(Boolean).length;

    if (resultFlags > 1) {
      return res.status(400).json({
        success: false,
        message:
          "A tip cannot be won, lost, and refunded at the same time.",
      });
    }

    // --------------------------------------------------------
    // Create tip
    // --------------------------------------------------------

    const tip = await Tips.create({
      league: league || null,
      date: date || null,
      time: time || null,
      match: match || null,

      source: normalizedSource,

      market: market || null,
      prediction: prediction || null,
      odds:
        odds === undefined || odds === null || odds === ""
          ? null
          : Number(odds),

      confidence:
        confidence === undefined || confidence === null || confidence === ""
          ? null
          : Number(confidence),

      analysis: analysis || null,

      tipsType: normalizedTipsType,

      homeScore:
        homeScore === undefined || homeScore === null || homeScore === ""
          ? null
          : Number(homeScore),

      awayScore:
        awayScore === undefined || awayScore === null || awayScore === ""
          ? null
          : Number(awayScore),

      halfTimeHomeScore:
        halfTimeHomeScore === undefined ||
        halfTimeHomeScore === null ||
        halfTimeHomeScore === ""
          ? null
          : Number(halfTimeHomeScore),

      halfTimeAwayScore:
        halfTimeAwayScore === undefined ||
        halfTimeAwayScore === null ||
        halfTimeAwayScore === ""
          ? null
          : Number(halfTimeAwayScore),

      homeCorners:
        homeCorners === undefined || homeCorners === null || homeCorners === ""
          ? null
          : Number(homeCorners),

      awayCorners:
        awayCorners === undefined || awayCorners === null || awayCorners === ""
          ? null
          : Number(awayCorners),

      homeBookings:
        homeBookings === undefined ||
        homeBookings === null ||
        homeBookings === ""
          ? null
          : Number(homeBookings),

      awayBookings:
        awayBookings === undefined ||
        awayBookings === null ||
        awayBookings === ""
          ? null
          : Number(awayBookings),

      isWon:
        isWon === undefined || isWon === null
          ? null
          : Boolean(isWon),

      isLost:
        isLost === undefined || isLost === null
          ? null
          : Boolean(isLost),

      isRefunded:
        isRefunded === undefined || isRefunded === null
          ? null
          : Boolean(isRefunded),
    });

    return res.status(201).json({
      success: true,
      message: "Tip created successfully.",
      data: tip,
    });
  } catch (error) {
    console.error("createTips error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// UPDATE TIP
// ============================================================

export const updateTip = async (req, res) => {
  const tipId = req.params.tipId;

  try {
    const tip = await Tips.findByPk(tipId);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: "Oops! No such tip.",
      });
    }

    const {
      league,
      date,
      time,
      match,

      source,

      market,
      prediction,
      odds,
      confidence,
      analysis,

      tipsType,

      homeScore,
      awayScore,

      halfTimeHomeScore,
      halfTimeAwayScore,

      homeCorners,
      awayCorners,

      homeBookings,
      awayBookings,

      isWon,
      isLost,
      isRefunded,
    } = req.body;

    // --------------------------------------------------------
    // Normalize values
    // --------------------------------------------------------

    const normalizedTipsType =
      tipsType !== undefined
        ? normalizeTipType(tipsType)
        : tip.tipsType;

    const normalizedSource =
      source !== undefined
        ? normalizeSource(source)
        : tip.source;

    // --------------------------------------------------------
    // Validate result flags
    // --------------------------------------------------------

    const finalIsWon =
      isWon !== undefined ? Boolean(isWon) : tip.isWon;

    const finalIsLost =
      isLost !== undefined ? Boolean(isLost) : tip.isLost;

    const finalIsRefunded =
      isRefunded !== undefined
        ? Boolean(isRefunded)
        : tip.isRefunded;

    const resultFlags = [
      finalIsWon,
      finalIsLost,
      finalIsRefunded,
    ].filter(Boolean).length;

    if (resultFlags > 1) {
      return res.status(400).json({
        success: false,
        message:
          "A tip cannot be won, lost, and refunded at the same time.",
      });
    }

    // --------------------------------------------------------
    // Validate confidence
    // --------------------------------------------------------

    if (
      confidence !== undefined &&
      confidence !== null &&
      confidence !== ""
    ) {
      const confidenceNumber = Number(confidence);

      if (
        !Number.isFinite(confidenceNumber) ||
        confidenceNumber < 0 ||
        confidenceNumber > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Confidence must be between 0 and 100.",
        });
      }
    }

    // --------------------------------------------------------
    // Validate odds
    // --------------------------------------------------------

    if (odds !== undefined && odds !== null && odds !== "") {
      const oddsNumber = Number(odds);

      if (!Number.isFinite(oddsNumber) || oddsNumber <= 0) {
        return res.status(400).json({
          success: false,
          message: "Odds must be a positive number.",
        });
      }
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    await tip.update({
      league:
        league !== undefined ? league || null : tip.league,

      date:
        date !== undefined ? date || null : tip.date,

      time:
        time !== undefined ? time || null : tip.time,

      match:
        match !== undefined ? match || null : tip.match,

      source: normalizedSource,

      market:
        market !== undefined ? market || null : tip.market,

      prediction:
        prediction !== undefined
          ? prediction || null
          : tip.prediction,

      odds:
        odds !== undefined
          ? odds === "" || odds === null
            ? null
            : Number(odds)
          : tip.odds,

      confidence:
        confidence !== undefined
          ? confidence === "" || confidence === null
            ? null
            : Number(confidence)
          : tip.confidence,

      analysis:
        analysis !== undefined
          ? analysis || null
          : tip.analysis,

      tipsType: normalizedTipsType,

      homeScore:
        homeScore !== undefined
          ? homeScore === "" || homeScore === null
            ? null
            : Number(homeScore)
          : tip.homeScore,

      awayScore:
        awayScore !== undefined
          ? awayScore === "" || awayScore === null
            ? null
            : Number(awayScore)
          : tip.awayScore,

      halfTimeHomeScore:
        halfTimeHomeScore !== undefined
          ? halfTimeHomeScore === "" || halfTimeHomeScore === null
            ? null
            : Number(halfTimeHomeScore)
          : tip.halfTimeHomeScore,

      halfTimeAwayScore:
        halfTimeAwayScore !== undefined
          ? halfTimeAwayScore === "" || halfTimeAwayScore === null
            ? null
            : Number(halfTimeAwayScore)
          : tip.halfTimeAwayScore,

      homeCorners:
        homeCorners !== undefined
          ? homeCorners === "" || homeCorners === null
            ? null
            : Number(homeCorners)
          : tip.homeCorners,

      awayCorners:
        awayCorners !== undefined
          ? awayCorners === "" || awayCorners === null
            ? null
            : Number(awayCorners)
          : tip.awayCorners,

      homeBookings:
        homeBookings !== undefined
          ? homeBookings === "" || homeBookings === null
            ? null
            : Number(homeBookings)
          : tip.homeBookings,

      awayBookings:
        awayBookings !== undefined
          ? awayBookings === "" || awayBookings === null
            ? null
            : Number(awayBookings)
          : tip.awayBookings,

      isWon: finalIsWon,
      isLost: finalIsLost,
      isRefunded: finalIsRefunded,
    });

    return res.status(200).json({
      success: true,
      message: "Tip updated successfully.",
      data: tip,
    });
  } catch (error) {
    console.error("updateTip error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DELETE TIP
// ============================================================

export const deleteTip = async (req, res) => {
  const tipId = req.params.tipId;

  try {
    const tip = await Tips.findByPk(tipId);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: "Tip not found.",
      });
    }

    await tip.destroy();

    return res.status(200).json({
      success: true,
      message: "Tip deleted successfully.",
    });
  } catch (error) {
    console.error("deleteTip error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ALL TIPS
// ============================================================

export const getTips = async (req, res) => {
  try {
    const {
      tipsType,
      source,
      market,
      league,
      date,
    } = req.query;

    const where = {};

    // --------------------------------------------------------
    // Tips type filter
    // --------------------------------------------------------

    if (tipsType && tipsType !== "all") {
      const normalizedTipsType = normalizeTipType(tipsType);

      where.tipsType = normalizedTipsType;
    }

    // --------------------------------------------------------
    // Source filter
    // --------------------------------------------------------

    if (source && source !== "all") {
      where.source = normalizeSource(source);
    }

    // --------------------------------------------------------
    // Market filter
    // --------------------------------------------------------

    if (market && market !== "all") {
      where.market = market;
    }

    // --------------------------------------------------------
    // League filter
    // --------------------------------------------------------

    if (league && league !== "all") {
      where.league = league;
    }

    // --------------------------------------------------------
    // Date filter
    // --------------------------------------------------------

    if (date) {
      where.date = date;
    }

    const tips = await Tips.findAll({
      where,
      order: [
        ["date", "DESC"],
        ["time", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: tips,
    });
  } catch (error) {
    console.error("getTips error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET TIP BY ID
// ============================================================

export const getTipById = async (req, res) => {
  const tipId = req.params.tipId;

  try {
    const tip = await Tips.findByPk(tipId);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: "Oops! No such tip.",
      });
    }

    return res.status(200).json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error("getTipById error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

export default {
  createTips,
  updateTip,
  deleteTip,
  getTips,
  getTipById,
};
