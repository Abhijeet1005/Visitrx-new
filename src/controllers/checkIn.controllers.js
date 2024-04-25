import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CheckIn } from "../models/checkIn.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllCheckIns = asyncHandler(async (req,res)=>{
    const checkIns = await CheckIn.find()

    if(checkIns === undefined){
        throw new ApiError(500,"Unable to fetch check-ins")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-Ins fetched successfully",
            checkIns
        )
    )
})

const checkInRequest = asyncHandler(async (req,res)=>{
    //This will send a checkIn add request an if the token gets verified we call addCheckIn (and pass the checkIn time)

})

const addCheckIn = asyncHandler(async (req,res)=>{
    //This will just read the req and add the checkIn (can be called from checkInRequest or directly if the logged in user is security admin)

    const { guest, personName, comingFrom, contactNo, meetingWith, floor, department, purpose, remark,} = req.body

    //check for meetingWith, personName, contactNo

    if(!(personName && contactNo && meetingWith)){
        throw new ApiError(400, "Fill the necessary fields")
    }

    //check for image

    let cloudinaryImage = null;

    if (req.file?.path) {
        const image = req.file.path;
        cloudinaryImage = await uploadOnCloudinary(image);
    }

    const checkIn = await CheckIn.create({
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
        image: cloudinaryImage
    })

    if(!checkIn){
        throw new ApiError(500,"Unable to create the check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in created successfully",
            checkIn
        )
    )

    
})

const updateCheckIn = asyncHandler(async (req,res)=>{
    const { id } = req.body

    if (!id) {
        throw new ApiError(400, "Please provide check-in ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid check-in ID");
    }

    const { guest, personName, comingFrom, contactNo, meetingWith, floor, department, purpose, remark,} = req.body

    const checkIn = await CheckIn.findByIdAndUpdate({
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
    })

    if(!checkIn){
        throw new ApiError(500,"Unable to update the check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in updated successfully",
            checkIn
        )
    )
})

const checkOut = asyncHandler(async (req,res)=>{
    const { id } = req.body

    if (!id) {
        throw new ApiError(400, "Please provide check-in ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid check-in ID");
    }

    const checkIn = await CheckIn.findByIdAndUpdate(id,{
        checkOut: Date.now()
    })

    if(!checkIn){
        throw new ApiError(500,"Unable to update check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in updated",
            checkIn
        )
    )

})

export { getAllCheckIns,checkInRequest,addCheckIn,updateCheckIn,checkOut }
