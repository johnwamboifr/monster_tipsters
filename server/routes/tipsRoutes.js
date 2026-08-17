import express from "express";
import { isAdmin, verifyToken } from "../middlewares/AuthMiddleware.js";

import {
  deleteTip,
  createTips,
  updateTip,
  getTipById,
  getTips,
} from "../controllers/tipsController.js";

const router = express.Router();

// ============================================================
// ADMIN
// ============================================================

// Create a manual tip
router.post("/create", isAdmin, createTips);

// Update an existing tip
router.put("/update/:tipId", isAdmin, updateTip);

// Delete a tip
router.delete("/delete/:tipId", isAdmin, deleteTip);

// ============================================================
// AUTHENTICATED USERS
// ============================================================

// Get tips
router.get("/get", verifyToken, getTips);

// Get a single tip
router.get("/get/:tipId", verifyToken, getTipById);

export default router;
