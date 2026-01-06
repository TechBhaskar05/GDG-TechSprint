import Complaint from "../models/complaint.model.js";
import Ward from "../models/ward.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Services
import { analyzeComplaintWithAI } from "../services/ai.service.js";
import { calculatePriority } from "../services/priority.service.js";

/**
 * CREATE COMPLAINT (Citizen)
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

  if (!ward) throw new ApiError(404, "Ward not found for this location");

  let aiResult;
  try {
    aiResult = await analyzeComplaintWithAI({ imageUrl, description });
  } catch (err) {
    aiResult = {
      category: "road",
      severity: "medium",
      keywords: ["manual_review_required"],
    };
  }

  const complaint = await Complaint.create({
    reportedBy: user._id,
    description,
    imageUrl,
    location: { lat, lng },
    wardId: ward._id,
    aiCategory: aiResult.category,
    aiSeverity: aiResult.severity,
    aiKeywords: aiResult.keywords,
  });

  complaint.priorityScore = calculatePriority(complaint);
  await complaint.save();

  return res
    .status(201)
    .json(new ApiResponse(201, complaint, "Complaint submitted successfully"));
});

/**
 * EDIT COMPLAINT (Citizen)
 * Now handles updates for Description, Image, and Location.
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { description, location } = req.body;
  const userId = req.user._id;
  const newImageUrl = req.imageUrl; // Populated by uploadImage middleware if a new file is sent

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (complaint.reportedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to edit this report");
  }

  if (complaint.status !== "submitted") {
    throw new ApiError(
      400,
      "Cannot edit a report that is already in progress or resolved"
    );
  }

  // 1. Update Description
  if (description) complaint.description = description;

  // 2. Update Image if a new one was uploaded
  if (newImageUrl) complaint.imageUrl = newImageUrl;

  // 3. Update Location and Ward if new coordinates are sent
  if (location && location.lat && location.lng) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);

    complaint.location = { lat, lng };

    const newWard = await Ward.findOne({
      boundary: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    });
    if (newWard) complaint.wardId = newWard._id;
  }

  // 4. Re-run AI analysis on the updated content
  try {
    const aiResult = await analyzeComplaintWithAI({
      imageUrl: complaint.imageUrl,
      description: complaint.description,
    });
    complaint.aiCategory = aiResult.category;
    complaint.aiSeverity = aiResult.severity;
    complaint.aiKeywords = aiResult.keywords;
    complaint.priorityScore = calculatePriority(complaint);
  } catch (error) {
    console.error("AI Re-analysis failed during edit:", error.message);
  }

  await complaint.save();
  res.json(
    new ApiResponse(200, complaint, "Complaint fully updated successfully")
  );
});

/**
 * DELETE COMPLAINT (Citizen/Authority)
 */
export const deleteComplaint = asyncHandler(async (req, res) => {
  const user = req.user;
  const { complaintId } = req.params;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (user.role === "citizen") {
    if (complaint.reportedBy.toString() !== user._id.toString()) {
      throw new ApiError(403, "Unauthorized");
    }
    if (complaint.status !== "submitted") {
      throw new ApiError(400, "Cannot delete active reports");
    }
  }

  await Complaint.findByIdAndDelete(complaintId);
  res.json(new ApiResponse(200, null, "Deleted successfully"));
});

/**
 * UPDATE STATUS (Authority Only)
 */
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status, authorityRemarks, afterFixImageUrl } = req.body;

  if (user.role !== "authority") throw new ApiError(403, "Unauthorized");

  const complaint = await Complaint.findById(req.params.complaintId);
  if (!complaint) throw new ApiError(404, "Not found");

  if (!complaint.wardId.equals(user.wardId))
    throw new ApiError(403, "Wrong Ward");

  complaint.status = status;
  complaint.authorityRemarks = authorityRemarks || complaint.authorityRemarks;

  if (status === "resolved") {
    if (!afterFixImageUrl) throw new ApiError(400, "After-fix image required");
    complaint.afterFixImageUrl = afterFixImageUrl;
    complaint.resolvedAt = new Date();
  }

  await complaint.save();
  res.json(new ApiResponse(200, complaint, "Status updated"));
});

/**
 * GETTERS
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .select("location priorityScore aiCategory status")
    .sort({ priorityScore: -1 });
  res.json(new ApiResponse(200, complaints, "Success"));
});

export const getWardComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ wardId: req.user.wardId }).sort({
    priorityScore: -1,
    createdAt: -1,
  });
  res.json(new ApiResponse(200, complaints, "Success"));
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.complaintId)
    .populate("reportedBy", "name")
    .populate("wardId", "name");
  res.json(new ApiResponse(200, complaint, "Success"));
});

export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ reportedBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(new ApiResponse(200, complaints, "Success"));
});
