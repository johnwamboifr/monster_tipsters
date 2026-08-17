import express from "express";
import { getHomeData } from "../controllers/football/homeController.js";

import {
  createPrediction,
  updatePredictionByMatch,
  patchPredictionByMatch,
  deletePredictionByMatch,
  getPredictionByMatch,
  getPredictions,
  getFeaturedPredictions,
  getFreePredictions,
  getPremiumPredictions,
  getCompletedPredictions,
} from "../controllers/football/predictionController.js";

import {
  getFixtures,
  getMatchDetails,
} from "../controllers/football/fixturesController.js";

import {
  getFinishedMatches,
} from "../controllers/football/resultsController.js";

import {
  getStandings,
} from "../controllers/football/standingsController.js";

import {
  getLeagues,
} from "../controllers/football/leaguesController.js";

import {
  getTeams,
} from "../controllers/football/teamsController.js";

import {
  getSeasons,
} from "../controllers/football/seasonsController.js";

import {
  getScorers,
} from "../controllers/football/scorersController.js";
import { verifyToken, requirePlanAccess } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/home", getHomeData);

//router.get("/predictions/today", getTodayPredictions);
//router.get("/predictions/tomorrow", getTomorrowPredictions);
router.get("/predictions", getPredictions);
router.post("/predictions", createPrediction);
router.get("/predictions/free", getFreePredictions);
router.get("/predictions/premium", verifyToken, requirePlanAccess("SILVER"), getPremiumPredictions);
router.get("/predictions/completed", getCompletedPredictions);
router.get("/predictions/featured", getFeaturedPredictions);
router.get("/predictions/:matchId", getPredictionByMatch);
router.put("/predictions/:matchId", updatePredictionByMatch);
router.patch("/predictions/:matchId", patchPredictionByMatch);
router.delete("/predictions/:matchId", deletePredictionByMatch);

router.get("/fixtures", getFixtures);
router.get("/fixtures/:matchId", getMatchDetails);
router.get("/results", getFinishedMatches);

router.get(["/standings", "/standings/:leagueId"], getStandings);
router.get("/leagues", getLeagues);
router.get("/teams", getTeams);
router.get("/seasons", getSeasons);
router.get("/scorers", getScorers);

export default router;
