import express from "express";

import {
  syncLeagueData,
  syncTeamData,
  syncFixtureData,
  syncStandingData,
  syncResultData,
  
  FOOTBALL_COMPETITIONS
} from "../utils/sync/footballSyncService.js";

//import { FOOTBALL_COMPETITIONS } from "../config/football-competitions.js";

const router = express.Router();

/*
 * IMPORTANT:
 * Protect this router with your existing admin authentication
 * middleware before mounting it in index.js.
 */

/**
 * Full football synchronization
 */


/**
 * Sync leagues
 */
router.post("/sync/leagues", async (_req, res) => {
  try {
    const result = await syncLeagueData(
      FOOTBALL_COMPETITIONS
    );

    return res.status(200).json({
      success: true,
      message: "League synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("[Admin Football] League sync failed:", error);

    return res.status(500).json({
      success: false,
      message: "League synchronization failed.",
      error: error?.message,
    });
  }
});

/**
 * Sync teams
 */
router.post("/sync/teams", async (_req, res) => {
  try {
    const result = await syncTeamData(
      FOOTBALL_COMPETITIONS
    );

    return res.status(200).json({
      success: true,
      message: "Team synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("[Admin Football] Team sync failed:", error);

    return res.status(500).json({
      success: false,
      message: "Team synchronization failed.",
      error: error?.message,
    });
  }
});

/**
 * Sync fixtures
 */
router.post("/sync/fixtures", async (_req, res) => {
  try {
    const result = await syncFixtureData(
      FOOTBALL_COMPETITIONS
    );

    return res.status(200).json({
      success: true,
      message: "Fixture synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("[Admin Football] Fixture sync failed:", error);

    return res.status(500).json({
      success: false,
      message: "Fixture synchronization failed.",
      error: error?.message,
    });
  }
});

/**
 * Sync standings
 */
router.post("/sync/standings", async (_req, res) => {
  try {
    const result = await syncStandingData(
      FOOTBALL_COMPETITIONS
    );

    return res.status(200).json({
      success: true,
      message: "Standing synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("[Admin Football] Standing sync failed:", error);

    return res.status(500).json({
      success: false,
      message: "Standing synchronization failed.",
      error: error?.message,
    });
  }
});



/**
 * Sync finished matches/results
 */
router.post("/sync/results", async (_req, res) => {
  try {
    const result = await syncResultData();

    return res.status(200).json({
      success: true,
      message: "Result synchronization completed.",
      data: result,
    });
  } catch (error) {
    console.error("[Admin Football] Result sync failed:", error);

    return res.status(500).json({
      success: false,
      message: "Result synchronization failed.",
      error: error?.message,
    });
  }
});

export default router;
