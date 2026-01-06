// controllers/ward.controller.js
import Ward from "../models/ward.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWards = asyncHandler(async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.json(new ApiResponse(200, [], "City is required"));
  }

  const wards = await Ward.find({
    city: { $regex: new RegExp(`^${city}$`, "i") }, // case-insensitive
  }).select("_id name city");

  return res.json(
    new ApiResponse(200, wards, "Wards fetched successfully")
  );
});

export const getCities = asyncHandler(async (req, res) => {
  const cities = await Ward.distinct("city");

  return res.json(
    new ApiResponse(200, cities, "Cities fetched successfully")
  );
});
