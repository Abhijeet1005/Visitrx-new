import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CheckIn } from "../models/checkIn.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateToken } from "../utils/tokenizer.js";
import { User } from "../models/user.model.js";
import { emailer } from "../utils/emailer.js";

const getAllCheckIns = asyncHandler(async (req,res)=>{
    const checkIns = await CheckIn.find().sort({ checkIn: -1 });

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

    const { guest, personName, comingFrom, contactNo, meetingWith, floor, department, purpose, remark, checkIn} = req.body

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

    const data = {
        checkIn,
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
        cloudinaryImage : cloudinaryImage?.url
    }

    const securityAdmin = await User.find({
        role: "SecurityAdmin",
    })

    if(!securityAdmin){
        throw new ApiError(500, "Unable to find a security admin")
    }

    const token = generateToken(data)
    const emailContent = `
    <h1>To verify the check-in of ${personName} with contact ${contactNo}</h1>
    <br>
    <a href="${process.env.USER_CHECKIN}?token=${token}">Click Here</a>
    `;
    const emailSubject = "Check-in request Email";

    const emailSent = await emailer(securityAdmin[0].email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
    }

})

const addCheckIn = asyncHandler(async (req,res)=>{
    //This will just read the req and add the checkIn (can be called from checkInRequest or directly if the logged in user is security admin)

    const { guest, personName, comingFrom, contactNo, meetingWith, floor, department, purpose, remark, checkIn} = req.body

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

    const checkInDoc = await CheckIn.create({
        checkIn,
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
        image: cloudinaryImage?.url
    })

    if(!checkInDoc){
        throw new ApiError(500,"Unable to create the check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in created successfully",
            checkInDoc
        )
    )

    
})

//This will be called from the token's checkin request route
const addCheckInFromToken = asyncHandler( async (req,res)=>{
    const {
        checkIn,
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
        cloudinaryImage
    } = req.tokenData


    const checkInDoc = await CheckIn.create({
        checkIn,
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
        image: cloudinaryImage || null
    })

    if(!checkInDoc){
        throw new ApiError(500,"Unable to create check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in created successfully",
            checkInDoc
        )
    )


})

const updateCheckIn = asyncHandler(async (req,res)=>{
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Please provide check-in ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid check-in ID");
    }

    const { guest, personName, comingFrom, contactNo, meetingWith, floor, department, purpose, remark, checkOut, checkIn} = req.body

    const checkInDoc = await CheckIn.findByIdAndUpdate(id,{
        checkIn,
        checkOut,
        guest,
        personName,
        comingFrom,
        contactNo,
        meetingWith,
        floor,
        department,
        purpose,
        remark,
    },{
        new: true
    })

    if(!checkInDoc){
        throw new ApiError(500,"Unable to update the check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in updated successfully",
            checkInDoc
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
        checkOut: new Date().toISOString()
    },{
        new: true
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

const deleteCheckIn = asyncHandler(async (req,res)=>{

    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide check-in ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid check-in ID");
    }

    const checkIn = await CheckIn.findByIdAndDelete(id)

    if(!checkIn){
        throw new ApiError(500,"Unable to delete check-in")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Check-in deleted successfully",
            checkIn
        )
    )

})

export { getAllCheckIns,checkInRequest,addCheckIn,updateCheckIn,checkOut,addCheckInFromToken,deleteCheckIn}
