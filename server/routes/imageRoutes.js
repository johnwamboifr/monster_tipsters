import express from "express";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddleware.js";
import {
  getSingleImage,
  getImages,
  imageUpload,
  deleteImage,
  updateImage,
} from "../controllers/imageController.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/upload", upload.single("my_file"), isAdmin, imageUpload);
router.get("/get", verifyToken, getImages);
router.get("/get/:imageId", verifyToken, getSingleImage);
router.put("/update/:imageId", upload.single("my_file"), isAdmin, updateImage);
router.delete("/delete/:imageId", isAdmin, deleteImage);

export default router;
