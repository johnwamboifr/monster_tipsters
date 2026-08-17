import express from "express";
import {
  createUsers,
  deleteUser,
  updateUser,
  getUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/create", isAdmin, createUsers);
router.delete("/delete/:userId", isAdmin, deleteUser);
router.put("/update/:userId", verifyToken, updateUser);
router.get("/get", verifyToken, getUsers);
router.get("/get/:userId", verifyToken, getUserById);
router.get("/getprofile", verifyToken, getUserProfile);
router.put("/updateprofile", verifyToken, updateUserProfile);

export default router;
