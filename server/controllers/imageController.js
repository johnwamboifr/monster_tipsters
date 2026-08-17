import { imageUploadUtil, deleteImageUtil, getPublicIdFromUrl } from "../utils/cloudinary.js";
import db from "../models/index.js";

const { Images } = db;

export const imageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.mimetype};base64,${b64}`;

    const result = await imageUploadUtil({ buffer: req.file.buffer });
    const image = await Images.create({
      publicId: result.public_id,
      imageUrl: result.secure_url,
      originalName: req.file.originalname,
    });

    res.status(200).json({
      success: true,
      data: image,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getImages = async (req, res) => {
  try {
    const images = await Images.findAll();
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const image = await Images.findOne({ where: { id: imageId } });

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.status(200).json({ success: true, data: image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const image = await Images.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    const publicId = getPublicIdFromUrl(image.imageUrl);
    if (publicId) await deleteImageUtil(publicId);

    const result = await imageUploadUtil({ buffer: req.file.buffer });

    image.publicId = result.public_id;
    image.imageUrl = result.secure_url;
    image.originalName = req.file.originalname;
    await image.save();

    res.status(200).json({
      success: true,
      data: image,
      message: "image updated successfull",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Images.findByPk(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    await deleteImageUtil(image.publicId);
    await image.destroy();

    res.status(201).json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  imageUpload,
  getImages,
  getSingleImage,
  updateImage,
  deleteImage,
};
