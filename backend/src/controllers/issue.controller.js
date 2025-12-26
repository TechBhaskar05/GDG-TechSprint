import Issue from "../models/issue.model.js";

export const createIssue = async (req, res) => {
  try {
    const { description, lat, lng } = req.body;

    const issue = await Issue.create({
      userId: req.user.id,
      description,
      imageUrl: req.imageUrl,   // ← from uploadImage middleware
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      status: "submitted",
    });

    res.json({ success: true, data: issue });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
