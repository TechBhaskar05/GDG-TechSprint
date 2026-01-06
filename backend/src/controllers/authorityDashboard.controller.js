import Complaint from "../models/complaint.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAuthorityDashboard = asyncHandler(async (req, res) => {
  const user = req.user; // comes from auth middleware

  // ⚠️ DO NOT change role logic
  if (user.role !== "authority") {
    return res.status(403).json({ message: "Access denied" });
  }

  const wardId = user.wardId;

  const total = await Complaint.countDocuments({ wardId });

  const highPriority = await Complaint.countDocuments({
    wardId,
    priorityScore: { $gte: 80 },
    status: { $ne: "resolved" },
  });

  const inProgress = await Complaint.countDocuments({
    wardId,
    status: "in_progress",
  });

  const resolvedToday = await Complaint.countDocuments({
    wardId,
    status: "resolved",
    resolvedAt: {
      $gte: new Date().setHours(0, 0, 0, 0),
    },
  });

  const recent = await Complaint.find({ wardId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(
    new ApiResponse(200, {
      stats: {
        total,
        highPriority,
        inProgress,
        resolvedToday,
      },
      recent,
    })
  );
});
