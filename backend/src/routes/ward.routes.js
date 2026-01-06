// routes/ward.routes.js
import express from "express";
import { getWards } from "../controllers/ward.controller.js";
import { getCities } from "../controllers/ward.controller.js";

const router = express.Router();

// GET /api/wards?city=Lucknow
router.get("/cities", getCities); 
router.get("/", getWards);

export default router;
