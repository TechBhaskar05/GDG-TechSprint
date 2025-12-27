import Complaint from "../models/complaint.model.js"
import Ward from "../models/ward.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

// Create Complaint [citizen]

export const createComplaint = asyncHandler(async(req,res) => {

    const user = req.user;

    if(user.role !== "citizen") {
        throw new ApiError(403,"Only citizens can report complaints");
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

    const lat = Number(req.body.location.lat);
    const lng = Number(req.body.location.lng);

    if (isNaN(lat) || isNaN(lng)) {
        throw new ApiError(400, "Latitude and longitude must be numbers");
    }


    // Ward detection
    const ward = await Ward.findOne({
        boundary: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                }
            }
        }
    });

    // const ward = await Ward.findOne();

    if(!ward){
        throw new ApiError(404,"Ward not found for this location");
    }

    const complaint = await Complaint.create({
        reportedBy: user._id,
        description,
        imageUrl,
        location,
        wardId: ward._id
    });

    res
    .status(201)
    .json(new ApiResponse(201,complaint,"Complaint submitted successfully"));

});

// Get all complaints

export const getAllComplaints = asyncHandler(async(req,res) => {
    const complaints = await Complaint.find()
        .select("location priorityScore aiCategory status")
        .sort({priorityScore: -1});
    
        res.json(new ApiResponse(200,complaints,"Complaints fetched successfully"));
});