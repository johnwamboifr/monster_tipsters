import db from "../../models/index.js";

const { Match, Prediction, League, Team } = db;

const logHomeControllerError = (endpoint, error, context = {}) => {
  console.error(`[${endpoint}]`, {
    message: error?.message,
    stack: error?.stack,
    endpoint,
    sql: error?.sql || error?.parent?.sql || null,
    ...context,
  });
};

export const getHomeData = async (req, res) => {
  const endpoint = req.originalUrl || "/api/home";

  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [todayMatches, featuredPredictions, recentWins, statistics] = await Promise.all([
      Match.findAll({
        where: { kickoffTime: { [db.Sequelize.Op.between]: [startOfDay, endOfDay] } },
        include: [
          { model: League, attributes: ["name", "logo"] },
          { model: Team, as: "homeTeam", attributes: ["name"] },
          { model: Team, as: "awayTeam", attributes: ["name"] },
        ],
        limit: 8,
        order: [["kickoffTime", "ASC"]],
      }),
      Prediction.findAll({
        where: { isFeatured: true },
        include: [{ model: Match, as: "match", include: [{ model: League, attributes: ["name"] }, { model: Team, as: "homeTeam", attributes: ["name"] }, { model: Team, as: "awayTeam", attributes: ["name"] }] }],
        limit: 6,
        order: [["publishedAt", "DESC"]],
      }),
      Prediction.findAll({
        where: { result: "won" },
        include: [{ model: Match, as: "match", include: [{ model: League, attributes: ["name"] }, { model: Team, as: "homeTeam", attributes: ["name"] }, { model: Team, as: "awayTeam", attributes: ["name"] }] }],
        limit: 6,
        order: [["updatedAt", "DESC"]],
      }),
      Promise.all([Match.count(), Prediction.count(), League.count(), Team.count()]),
    ]);

    const payload = {
      todayMatches: todayMatches.map((match) => ({
        id: match.matchId,
        league: match.League?.name,
        homeTeam: match.homeTeam?.name,
        awayTeam: match.awayTeam?.name,
        kickoffTime: match.kickoffTime,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      })),
      featuredPredictions: featuredPredictions.map((prediction) => ({
        id: prediction.id,
        prediction: prediction.prediction,
        market: prediction.market,
        odds: prediction.odds,
        analysis: prediction.analysis,
        isPremium: prediction.isPremium,
        isFeatured: prediction.isFeatured,
        match: prediction.match ? `${prediction.match.homeTeam?.name || ""} vs ${prediction.match.awayTeam?.name || ""}` : null,
        league: prediction.match?.League?.name,
      })),
      recentWins: recentWins.map((prediction) => ({
        id: prediction.id,
        prediction: prediction.prediction,
        match: prediction.match ? `${prediction.match.homeTeam?.name || ""} vs ${prediction.match.awayTeam?.name || ""}` : null,
        league: prediction.match?.League?.name,
      })),
      statistics: {
        matches: statistics[0],
        predictions: statistics[1],
        leagues: statistics[2],
        teams: statistics[3],
      },
    };

    return res.json({ success: true, data: payload });
  } catch (error) {
    logHomeControllerError(endpoint, error, { operation: "getHomeData" });
    return res.status(500).json({ success: false, message: "Unable to load home data." });
  }
};

export const getHomeSummary = getHomeData;
