import Complaint from "../models/complaint.model.js"
import Ward from "../models/ward.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

// Create Complaint

const createComplaint = asyncHandler(async(req,res) => {

    const user = req.user;

    if(user.role !== "citizen") {
        throw new ApiError(403,"Only citizens can report complaints");
    }

    const {description, imageUrl, location} = req.body;

    if(!description || !imageUrl || !location?.lat || !location?.lng){
        throw new ApiError(400, "Description, image and location are required");
    }

    

})