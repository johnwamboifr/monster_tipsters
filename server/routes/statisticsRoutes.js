import { getStatistics } from "../controllers/statisticsController.js";
//import getStatistics from "../controllers/statisticsController.js";
import express from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const router = express.Router()

///for all users
router.get("/", verifyToken, getStatistics);



export default router
