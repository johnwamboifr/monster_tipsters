import express from "express";
import {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  changePassword,
  refreshToken,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-account", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", changePassword);
router.get("/refresh-token", verifyToken, refreshToken);

export default router;
