// server/controllers/statisticsController.js

import db from "../models/index.js";

const { Tips } = db;
const { Op } = db.Sequelize;

const TIP_TYPES = ["free", "bronze", "silver", "gold"];

const buildStats = (tips) => {
  const total = tips.length;

  const won = tips.filter((t) => t.isWon).length;

  const lost = tips.filter((t) => t.isLost).length;

  const refunded = tips.filter((t) => t.isRefunded).length;

  const pending = tips.filter(
    (t) =>
      !t.isWon &&
      !t.isLost &&
      !t.isRefunded
  ).length;

  const winRate =
    total > 0
      ? ((won / (won + lost)) * 100).toFixed(1)
      : 0;

  return {
    total,
    won,
    lost,
    refunded,
    pending,
    winRate: Number(winRate),
  };
};

export const getStatistics = async (req, res) => {
  try {
    const allTips = await Tips.findAll({
      attributes: [
        "tipsType",
        "isWon",
        "isLost",
        "isRefunded",
      ],
    });

    const overall = buildStats(allTips);

    const byPackage = {};

    for (const type of TIP_TYPES) {
      const packageTips = allTips.filter(
        (tip) => tip.tipsType === type
      );

      byPackage[type] = buildStats(packageTips);
    }

    return res.status(200).json({
      success: true,
      data: {
        overall,
        packages: byPackage,
      },
    });
  } catch (error) {
    console.error(
      "Statistics error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//export default {getStatistics}
