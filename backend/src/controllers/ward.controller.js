import Ward from "../models/ward.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createWard = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "authority") {
    throw new ApiError(403, "Only municipal admin can create wards");
  }

  const { name, city, boundary } = req.body;

  if (!name || !city) {
    throw new ApiError(400, "Ward name and city are required");
  }

  const ward = await Ward.create({
    name,
    city,
    boundary: boundary || null
  });

  res.status(201).json(
    new ApiResponse(201, ward, "Ward created successfully")
  );
});