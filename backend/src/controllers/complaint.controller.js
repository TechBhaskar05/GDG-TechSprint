import Complaint from "../models/complaint.model.js";
import Ward from "../models/ward.model.js";
import Vote from "../models/vote.model.js"; // Import needed for Discovery synchronization
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { fallbackClassify } from "../services/fallbackClassifier.js";
import { validateDescription } from "../utils/validateDescription.js";

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

  if (!description || !imageUrl || !location?.lat || !location?.lng) {
    throw new ApiError(400, "Description, image and location are required");
  }

  const isValidDescription = validateDescription(description);

  if (!isValidDescription) {
    throw new ApiError(
      400,
      "Please enter a relevant civic issue description"
    );
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  const ward = await Ward.findOne({
    boundary: {
      $geoIntersects: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
      },
    },
  });

  if (!ward) throw new ApiError(404, "Ward not found for this location");

  let aiCategory;
  let aiSeverity;
  let aiKeywords;
  let aiStatus;

  try {
    const aiResult = await analyzeComplaintWithAI({ imageUrl, description });

    // If AI explicitly returned fallback signal
    if (aiResult?.fallback || aiResult?.error) {
      const fallback = fallbackClassify(description);

      aiCategory = fallback.category;
      aiSeverity = fallback.severity;
      aiKeywords = fallback.keywords;
      aiStatus = "fallback";
    } else {
      aiCategory = aiResult.category;
      aiSeverity = aiResult.severity;
      aiKeywords = aiResult.keywords;
      aiStatus = "ai";
    }
  } catch (err) {

    const fallback = fallbackClassify(description);

    aiCategory = fallback.category;
    aiSeverity = fallback.severity;
    aiKeywords = fallback.keywords;
    aiStatus = "fallback";
  }


  const complaint = await Complaint.create({
    reportedBy: user._id,
    description,
    imageUrl,
    location: { lat, lng },
    wardId: ward._id,
    aiCategory,
    aiSeverity,
    aiKeywords,
    aiStatus,
  });

  complaint.priorityScore = calculatePriority(complaint);
  await complaint.save();

  return res
    .status(201)
    .json(new ApiResponse(201, complaint, "Complaint submitted successfully"));
});

/**
 * GET ALL COMPLAINTS (Community Discovery)
 * UPDATED: Injects 'hasUpvoted' to prevent duplicate POST 400 errors
 * UPDATED: Selects more fields to fix missing Discovery data
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null; 

  const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();

  const complaintsWithVoteStatus = await Promise.all(
    complaints.map(async (complaint) => {
      let hasUpvoted = false;

      if (userId) {
        const userVote = await Vote.findOne({
          complaintId: complaint._id,
          userId,
        });
        hasUpvoted = !!userVote;
      }

      return {
        ...complaint,
        hasUpvoted,
      };
    })
  );

  return res.json(
    new ApiResponse(200, complaintsWithVoteStatus, "Fetched all complaints")
  );
});


/**
 * GET COMPLAINT BY ID
 * UPDATED: Injects vote status for individual detail view
 */
// Example for your GET /api/complaint/:id route
export const getComplaintById = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user._id;

  console.log(complaintId);
  

  console.log(userId);
  

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  // Check the Votes collection for this specific user and complaint
  const userVote = await Vote.findOne({
    complaintId,
    userId,
  });

  // Send the correct 'hasUpvoted' status so the frontend initializes correctly
  return res.json(
    new ApiResponse(200, {
      ...complaint._doc,
      hasUpvoted: !!userVote, // true if record exists, false otherwise
    })
  );
});
/**
 * UPDATE STATUS (Authority Only)
 */
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status, authorityRemarks } = req.body;
  const afterFixImageUrl = req.imageUrl;

  if (user.role !== "authority") throw new ApiError(403, "Unauthorized");
  if (!status) throw new ApiError(400, "Status is required");

  const complaint = await Complaint.findById(req.params.complaintId);
  if (!complaint) throw new ApiError(404, "Not found");

  if (!complaint.wardId.equals(user.wardId)) {
    throw new ApiError(403, "This complaint belongs to a different ward");
  }

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
 * EDIT COMPLAINT (Citizen)
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { description, location } = req.body;
  const userId = req.user._id;
  const newImageUrl = req.imageUrl;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (complaint.reportedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to edit this report");
  }

  if (complaint.status !== "submitted") {
    throw new ApiError(
      400,
      "Cannot edit a report already in progress or resolved"
    );
  }

  if (description) complaint.description = description;
  if (newImageUrl) complaint.imageUrl = newImageUrl;

  if (location?.lat && location?.lng) {
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
 * DELETE COMPLAINT
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
 * ADDITIONAL GETTERS
 */
export const getWardComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ wardId: req.user.wardId }).sort({
    priorityScore: -1,
    createdAt: -1,
  });
  res.json(new ApiResponse(200, complaints, "Success"));
});

export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ reportedBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(new ApiResponse(200, complaints, "Success"));
});
