import express from "express";
import {
  initiatePayheroSTKPush,
  handleCallback,
  getPaymentHistory,
  getPaymentStatus,
  getMyPayments,
  getPaymentConfig,
  createManualPayment,
  approvePayment,
  rejectPayment,
} from "../controllers/payheroController.js";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/stkpush", verifyToken, initiatePayheroSTKPush);
router.post("/manual", verifyToken, upload.single("screenshot"), createManualPayment);
router.get("/config", verifyToken, getPaymentConfig);
router.get("/all", isAdmin, getPaymentHistory);
router.get("/my", verifyToken, getMyPayments);
router.put("/approve/:paymentId", isAdmin, approvePayment);
router.put("/reject/:paymentId", isAdmin, rejectPayment);
router.get("/status/:checkoutId", getPaymentStatus);
router.post("/callback", handleCallback);

export default router;
