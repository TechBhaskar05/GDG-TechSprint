import express from "express"
import { createComplaint,getAllComplaints } from "../controllers/complaint.controller.js"

import auth from "../middleware/auth.middleware.js"

import upload, {uploadImage} from "../middleware/upload.middleware.js"

const router = express.Router();

// Create complaint
router.post("/",auth,upload.single("image"),uploadImage,createComplaint);

export default router;