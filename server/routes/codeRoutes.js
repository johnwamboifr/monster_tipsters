import express from "express";
import {
  getCode,
  createCode,
  updateCode,
  getCodeById,
  deleteCode,
} from "../controllers/codeController.js";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/get", verifyToken, getCode);
router.post("/create", isAdmin, createCode);
router.put("/update/:codeId", isAdmin, updateCode);
router.get("/get/:codeId", verifyToken, getCodeById);
router.delete("/delete/:codeId", isAdmin, deleteCode);

export default router;
