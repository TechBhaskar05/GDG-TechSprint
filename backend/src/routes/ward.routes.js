
import express from "express";
import { createWard } from "../controllers/ward.controller.js";
import auth  from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createWard);

export default router;
