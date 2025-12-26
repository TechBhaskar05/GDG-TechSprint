import mongoose from "mongoose";

const wardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },
    boundary: {
        type: Object,
        default: null
    },

    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

export default mongoose.model("Ward", wardSchema);