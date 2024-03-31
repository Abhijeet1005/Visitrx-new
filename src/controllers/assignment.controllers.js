import mongoose from "mongoose"
import { Asset } from "../models/asset.model.js"
import { Assignment } from "../models/assignment.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { emailer } from "../utils/emailer.js"
import { generateToken } from "../utils/tokenizer.js"

//This will create a request to assign asset
const assetAssignRequest= asyncHandler(async(req,res)=>{
    const { id } = req.params //Id of asset
    const { email , quantity} = req.body //User email and quantity to be assigned

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    if(!email){
        throw new ApiError(400,"Email cannot be empty")
    }

    if(!email.includes('@')){
        throw new ApiError(401,"Enter valid email")
    }

    const user = await User.findOne({
        email: email,
    }).select("-password -refreshToken")

    const asset = await Asset.findById(id)

    if(!user){
        throw new ApiError(401,"User doesn't exist")
    }

    if(!asset){
        throw new ApiError(401,"Asset doesn't exist")
    }

    if(!(quantity <= asset.quantityInStock)){
        throw new ApiError(401,"Cannot assign items more than the quantity in stock")
    }

    //Generating tokens after detail verification
    const data = {
        assetId: asset._id,
        userId: user._id,
        quantity
    }
    const token = generateToken(data)
    const emailContent = 
    `
    <h1>To verify the assignment of ${quantity} of ${asset.name}</h1>
    <br>
    <a href="${process.env.ASSET_TO_USER}/${token}" > Click here </a>
    `
    const emailinfo = await emailer(user.email,emailContent)

    if(emailinfo){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                "Email sent successfully",
                null
            )
        )
    }else{
        throw new ApiError(500,"Something happened on our end while sending the email")
    }

})

//This function will be called after token verification to assign the asset to user directly
const assetAssign = asyncHandler(async(req,res)=>{
    
    const {assetId, userId, quantity} = req.tokenData

    const asset = await Asset.findById(assetId)
    if(!asset){
        throw new ApiError(500,"Unable to fetch the asset requested")
    }

    //This check again to ensure that we have enough stock to assign
    if(!(quantity <= asset.quantityInStock)){
        throw new ApiError(400,"Not have enough stock to assign please check the quantity")
    }

    const assigned = await Assignment.create({
        assetAssigned: assetId,
        assignedTo: userId,
        quantityAssigned: quantity
    })
    if(!assigned){
        throw new ApiError(500,"Some error happened while assigning the asset")
    }

    asset.quantityInStock = asset.quantityInStock - parseInt(quantity)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Asset assigned successfully",
            assigned
        )
    )

})

//This will create an asset un-assign request
//Any signed in user can request for an asset un-asign
//Then the request will go to AssetAdmin
const assetUnAssignRequest = asyncHandler(async(req,res)=>{
    const { id } = req.params //This will be the assignment ID

    const assignment = await Assignment.findById(id)

    if(!assignment){
        throw new ApiError(400,"Assignment does not exist")
    }

    if(!(assignment.assignedTo.toString() === req.user._id.toString())){
        throw new ApiError(401,"Please login with the corresponding user ID")
    }

    // const user = await User.findById(assignment.assignedTo).select("-password -refreshToken")
    const asset = await Asset.findById(assignment.assetAssigned)
    const assetAdmin = await User.findOne({
        role: "AssetAdmin"
    })

    const data = {
        assignmentId: assignment._id
    }

    const token = generateToken(data)
    const emailContent = 
    `
    <h1>To verify the return of ${assignment.quantityAssigned} of ${asset.name}</h1>
    <br>
    <a href="${process.env.USER_TO_ASSET}/${token}" > Click here </a>
    `
    const emailinfo = await emailer(assetAdmin.email,emailContent)

    if(emailinfo){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                "Email sent successfully",
                null
            )
        )
    }else{
        throw new ApiError(500,"Something happened on our end while sending the email")
    }

})

const assetUnAssign = asyncHandler(async(req,res)=>{
    //Here we will receive the req.tokenData with the assignmentId
    const { assignmentId } = req.tokenData

    const assignment = await Assignment.findById(assignmentId)

    if(!assignment){
        throw new ApiError(401,"Unable to find the assignment")
    }

    //This so that we first delete the record then update the details
    const returnedQuantity = assignment.quantityAssigned 
    const asset = await Asset.findById(assignment.assetAssigned)

    const deleted = await Assignment.findByIdAndDelete(assignment._id)

    if(!deleted){
        throw new ApiError(500,"Unable to delete the assignment")
    }

    asset.quantityInStock = asset.quantityInStock + parseInt(returnedQuantity)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Return successfull",
            deleted
        )
    )
})

const getAssignmentsByAssetId = asyncHandler(async(req,res)=>{

})

const getAssignmentsByUserId = asyncHandler(async(req,res)=>{

})

const getAllForUser = asyncHandler(async(req,res)=>{
    const userEmail = req.params?.email

    const user = await User.findOne({
        email: userEmail
    })

    if(!user){
        throw new ApiError(401,"Unable to fetch the provided user")
    }

    const assignments = await Assignment.find({
        assignedTo: user._id
    })

    if(!assignments){
        throw new ApiError(500,"Unable to fetch the assignments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Fetched assignments if any",
            assignments
        )
    )
    
})

//Test change 
export {assetAssignRequest,assetAssign,assetUnAssignRequest,assetUnAssign,getAllForUser,getAssignmentsByAssetId,getAssignmentsByUserId}