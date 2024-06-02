import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const getAllMeetings = asyncHandler(async (req,res)=>{
    const meetings = await Meeting.find()

    if(!meetings){
        throw new ApiError(500, "Unable to fetch meetings")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Meetings fetched successfully",
            meetings
        )
    )
})

const getAllMeetingsForHead = asyncHandler(async (req,res)=>{
    //Need to filter based on the personInCharge which will filter for the department of which's head is logged-in

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(401, "Unable to fetch the department head details")
    }

    const meetings = await Meeting.find({
        personInCharge: user._id
    })

    if(meetings === undefined){
        throw new ApiError(500, "Unable to fetch meetings")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Meetings fetched for the logged-in department head",
            meetings
        )
    )
})

const addMeeting = asyncHandler(async (req,res)=>{
    const { meetingWithContact, meetingWithName, expectedTimeOfMeet, personInCharge} = req.body

    // Here we need to add logic that if the logged in user is app admin then we take the personInCharge as input otherwise we just use req.user._id as personInCharge

    let personInChargeId;
    if(req.user.role === "AppAdmin"){
        if(!personInCharge){
            throw new ApiError(400,"Person-In-Charge field is required")
        }
        personInChargeId = personInCharge
    }else{
        personInChargeId = req.user._id
    }


    if(!meetingWithContact || !expectedTimeOfMeet){
        throw new ApiError(400, "Fill the required fields")
    }


    const meeting = await Meeting.create({
        meetingWithContact,
        meetingWithName,
        expectedTimeOfMeet,
        personInCharge: personInChargeId
    })

    if(!meeting){
        throw new ApiError(500, "Unable to create meeting")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Meeting created",
            meeting
        )
    )

})

const updateMeeting = asyncHandler(async (req,res)=>{
    
    const { meetingWithContact, meetingWithName, expectedTimeOfMeet, meetingFinished} = req.body
    const {id} = req.params
    
    if (!id) {
        throw new ApiError(400, "Please provide meeting ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid meeting ID");
    }

    const meetingCheck = await Meeting.findById(id)

    if(!meetingCheck){
        throw new ApiError(401,"Unable to fetch meeting")
    }

    if(!(req.user.role === "AppAdmin")){
        if(!(meetingCheck.personInCharge === req.user._id)){
            throw new ApiError(400, "Not authorised to edit this meeting")
        }
    }

    const meeting = await Meeting.findByIdAndUpdate({
        meetingWithContact,
        meetingWithName,
        expectedTimeOfMeet,
        meetingFinished
    })

    if(!meeting){
        throw new ApiError(500, "Unable to update meeting")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Meeting updated",
            meeting
        )
    )

})

const deleteMeeting = asyncHandler(async (req,res)=>{

    const {id} = req.params
    
    if (!id) {
        throw new ApiError(400, "Please provide meeting ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid meeting ID");
    }

    const meetingCheck = await Meeting.findById(id)

    if(!meetingCheck){
        throw new ApiError(401,"Unable to fetch meeting")
    }

    if(!(req.user.role === "AppAdmin")){
        if(!(meetingCheck.personInCharge === req.user._id)){
            throw new ApiError(400, "Not authorised to delete this meeting")
        }
    }

    const meeting = await Meeting.findByIdAndDelete(id,{
        new: true
    })

    if(!meeting){
        throw new ApiError(500, "Unable to delete meeting")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Meeting deleted",
            meeting
        )
    )
})

export {
    getAllMeetings,
    getAllMeetingsForHead,
    addMeeting,
    updateMeeting,
    deleteMeeting,
}