import cloudinaryPkg from "cloudinary";
import streamifier from "streamifier";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const { v2: cloudinary } = cloudinaryPkg;

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "vincentsang",
  api_key: process.env.CLOUDINARY_API_KEY || "455286944547629",
  api_secret: process.env.CLOUDINARY_API_SECRET || "764okYVYwP9WOp5iXMKS7Oxbr7c",
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "monster",
};

cloudinary.config({
  ...CLOUDINARY_CONFIG,
  secure: true,
  api_proxy: process.env.CLOUDINARY_API_PROXY,
});

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const imageUploadUtil = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: CLOUDINARY_CONFIG.upload_preset,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Upload failed: ${error.message}`));
            return;
          }
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const deleteImageUtil = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
  });

  if (result.result !== "ok") {
    throw new Error(`Deletion failed: ${result.result}`);
  }

  return result;
};

export const getPublicIdFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/");
    return parts.slice(7).join("/").split(".")[0];
  } catch {
    return null;
  }
};

export { CLOUDINARY_CONFIG };
export default {
  upload,
  imageUploadUtil,
  deleteImageUtil,
  getPublicIdFromUrl,
  CLOUDINARY_CONFIG,
};
