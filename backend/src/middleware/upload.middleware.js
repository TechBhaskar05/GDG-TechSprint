import multer from "multer";
import cloudinary from "../db/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { v4 as uuid } from "uuid";

// Save file in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary uploader wrapper
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "Image is required");

    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: "civicfix_issues",
      public_id: uuid(),
    });

    // Attach Cloudinary URL to request for controller
    req.imageUrl = result.secure_url;

    next();
  } catch (err) {
    next(err);
  }
};

export default upload;
