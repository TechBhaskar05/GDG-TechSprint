import Complaint from "../models/complaint.model.js";
import Ward from "../models/ward.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Services
import { analyzeComplaintWithAI } from "../services/ai.service.js";
import { calculatePriority } from "../services/priority.service.js";

/**
 * ===============================
 * CREATE COMPLAINT (Citizen)
 * ===============================
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "citizen") {
    throw new ApiError(403, "Only citizens can report complaints");
  }

  const { description, location } = req.body;
  const imageUrl = req.imageUrl;

  if (
    !description ||
    !imageUrl ||
    !location ||
    !location.lat ||
    !location.lng
  ) {
    throw new ApiError(400, "Description, image and location are required");
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  if (isNaN(lat) || isNaN(lng)) {
    throw new ApiError(400, "Latitude and longitude must be numbers");
  }

  /**
   * Ward detection (existing logic – unchanged)
   */
  const ward = await Ward.findOne({
    boundary: {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
    },
  });

  if (!ward) {
    throw new ApiError(404, "Ward not found for this location");
  }

  /**
   * STEP 1: Create complaint immediately (FAST UX)
   */
  const complaint = await Complaint.create({
    reportedBy: user._id,
    description,
    imageUrl,
    location: {
      lat,
      lng,
    },
    wardId: ward._id,
  });

  /**
   * STEP 2: Respond immediately
   */
  res.status(201).json(
    new ApiResponse(201, complaint, "Complaint submitted successfully")
  );

  /**
   * STEP 3: AI + Priority (ASYNC, NON-BLOCKING)
   */
  try {
    const aiResult = await analyzeComplaintWithAI({
      imageUrl,
      description,
    });

    complaint.aiCategory = aiResult.category;
    complaint.aiSeverity = aiResult.severity;
    complaint.aiKeywords = aiResult.keywords;

    complaint.priorityScore = calculatePriority(complaint);

    await complaint.save();
  } catch (err) {
    console.error("AI processing failed:", err.message);
    // Fail silently – complaint already exists
  }
});

/**
 * ===============================
 * GET ALL COMPLAINTS (Map View)
 * ===============================
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .select("location priorityScore aiCategory status")
    .sort({ priorityScore: -1 });

  res.json(
    new ApiResponse(200, complaints, "Complaints fetched successfully")
  );
});
