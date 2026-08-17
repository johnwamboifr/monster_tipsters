import db from "../models/index.js";

const { Jackpots } = db;

export const createJackpot = async (req, res) => {
  try {
    const { type, prediction, match, jackpotType } = req.body;

    if (!type || !prediction || !match || !jackpotType) {
      return res.status(403).json({ success: false, message: "missing required fields." });
    }

    const createdJackpot = await Jackpots.create({
      type,
      prediction,
      match,
      jackpotType,
    });

    res.status(201).json({
      success: true,
      message: "Jackpot created successfully",
      data: createdJackpot,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJackpot = async (req, res) => {
  try {
    const jackpots = await Jackpots.findAll();
    res.status(200).json({ success: true, data: jackpots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJackpotById = async (req, res) => {
  try {
    const jackpotId = req.params.jackpotId;
    const jackpot = await Jackpots.findByPk(jackpotId);
    if (!jackpot) {
      return res.status(404).json({ success: false, message: "Ooops!, Jackpot not found" });
    }
    res.status(200).json({ success: true, data: jackpot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJackpot = async (req, res) => {
  const jackpotId = req.params.jackpotId;
  const { type, prediction, match, jackpotType } = req.body;
  try {
    const jackpot = await Jackpots.findByPk(jackpotId);
    if (!jackpot) {
      return res.status(404).json({ success: false, message: "Jackpot not found" });
    }

    const updateResult = await Jackpots.update(
      { type, prediction, match, jackpotType },
      { where: { id: jackpotId } }
    );

    res.status(200).json({
      success: true,
      message: "Jackpot updated successfully",
      data: updateResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJackpot = async (req, res) => {
  const jackpotId = req.params.jackpotId;
  try {
    const deletedJackpot = await Jackpots.destroy({
      where: { id: jackpotId },
    });

    res.status(201).json({
      success: true,
      message: "deleted succcessfully",
      data: deletedJackpot,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createJackpot,
  getJackpot,
  getJackpotById,
  updateJackpot,
  deleteJackpot,
};
