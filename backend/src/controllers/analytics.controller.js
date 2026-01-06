import Complaint  from "../models/complaint.model.js";

export const getAuthorityAnalytics = async (req, res) => {
  try {
    const wardId = req.user.wardId;

    const complaints = await Complaint.find({ wardId });

    // 1. Category count
    const categoryMap = {};
    complaints.forEach(c => {
      categoryMap[c.aiCategory] = (categoryMap[c.aiCategory] || 0) + 1;
    });

    // 2. Priority distribution
    const priority = { high: 0, medium: 0, low: 0 };
    complaints.forEach(c => {
      if (c.priorityScore >= 70) priority.high++;
      else if (c.priorityScore >= 40) priority.medium++;
      else priority.low++;
    });

    // 3. Status breakdown
    const status = {
      submitted: 0,
      acknowledged: 0,
      "in-progress": 0,
      resolved: 0,
    };

    complaints.forEach(c => status[c.status]++);

    // 4. Resolution time
    const resolved = complaints.filter(c => c.status === "resolved");
    const avgResolutionTime =
      resolved.length === 0
        ? 0
        : resolved.reduce((sum, c) => {
            const diff =
              (new Date(c.updatedAt) - new Date(c.createdAt)) /
              (1000 * 60 * 60 * 24);
            return sum + diff;
          }, 0) / resolved.length;

    res.json({
      categoryMap,
      priority,
      status,
      avgResolutionTime: avgResolutionTime.toFixed(1),
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics failed" });
  }
};
