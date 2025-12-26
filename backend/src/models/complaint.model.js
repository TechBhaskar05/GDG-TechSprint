import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    wardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ward",
        required: true
    },

    /* AI wale features */
    // to categorise the complaint
    aiCategory: {
        type: String,
        enum: ["garbage","road","drainage","lighting"],
        default: null
    },

    // to determine how much severe is the issue
    aiSeverity: {
        type: String,
        enum: ["low","medium","high"],
        default: null
    },

    // useful for giving priority score
    aiKeywords: [String],

    /* for prioity */

    priorityScore: {
        type: Number,
        default: 0
    },

    upvoteCount: {
        type: Number,
        default: 0
    },

    // Status [updated from officers side]

    status: {
        type: String,
        enum: ["submitted","acknowledged","in_progress","resolved"],
        default: "submitted"
    },

    authorityRemarks: String,

    afterFixImageUrl: String,

    resolvedAt: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("Complaint",complaintSchema);