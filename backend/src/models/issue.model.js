import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  description: { type: String, required: true },

  imageUrl: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },

  status: { type: String, default: "submitted" },

  createdAt: { type: Date, default: Date.now },
});

IssueSchema.index({ location: "2dsphere" });

export default mongoose.model("Issue", IssueSchema);
