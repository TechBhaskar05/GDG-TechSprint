import express from "express";
import auth from "../middleware/auth.middleware.js";
import upload, { uploadImage } from "../middleware/upload.middleware.js";
import { createIssue } from "../controllers/issue.controller.js";

const router = express.Router();

router.post("/create",
  auth,
  upload.single("image"),   // multer memory upload
  uploadImage,              // cloudinary upload
  createIssue               // controller
);

export default router;
