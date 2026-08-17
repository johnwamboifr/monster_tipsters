import express from "express";
import {
  getJackpot,
  createJackpot,
  updateJackpot,
  getJackpotById,
  deleteJackpot,
} from "../controllers/jackpotController.js";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/get", verifyToken, getJackpot);
router.post("/create", isAdmin, createJackpot);
router.put("/update/:jackpotId", isAdmin, updateJackpot);
router.get("/get/:jackpotId", verifyToken, getJackpotById);
router.delete("/delete/:jackpotId", isAdmin, deleteJackpot);

export default router;
