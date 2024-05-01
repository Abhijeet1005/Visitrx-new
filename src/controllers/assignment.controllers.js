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
    const emailContent = `
    <h1>To verify the assignment of ${quantity} of ${asset.productName}</h1>
    <br>
    <a href="${process.env.ASSET_TO_USER}?token=${token}">Click Here</a>
    `;
    const emailSubject = "Assignment Email";

    const emailSent = await emailer(user.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
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
    await asset.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Asset assigned successfully",
            assigned
        )
    )

})

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
    <h1>To verify the return of ${assignment.quantityAssigned} of ${asset.productName}</h1>
    <br>
    <a href="${process.env.USER_TO_ASSET}?token=${token}">Click Here</a>
    `
    const emailSubject = "Un-assignment Email";

    const emailSent = await emailer(assetAdmin.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
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
    if(asset.quantityTotal === 0){
        asset.quantityTotal = parseInt(returnedQuantity)
    }
    await asset.save()

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
    const id = req.params?.id

    if(!id){
        throw new ApiError(400, "Asset ID is required")
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }
    
    const assignments = await Assignment.find({
        assetAssigned: id
    })

    if(assignments === undefined){
        throw new ApiError(500,"Unable to fetch the assignments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Assignments fetched successfully",
            assignments
        )
    )
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

    if(assignments === undefined){
        throw new ApiError(500,"Unable to fetch the assignments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Assignments fetched successfully",
            assignments
        )
    )
    
})

const getAllForDepartment = asyncHandler(async (req,res)=>{
    //We'll fetch the admin name passed from the middleware
    //If the admin is asset admin or app admin we pass all the assignments
    //otherwise we pass the assignments with {admin department}Employee role assignments

    //For this we need to write a pipeline with a foreign lookup of assignedTo field in the User database then apply filter to filter out the results based on role

    const assignments = await Assignment.find();

    const filteredAssignments = assignments.filter(doc => {
        return doc.assignedTo && doc.assignedTo.role === `${req.department}Employee`;
    });

    if(!assignments){
        throw new ApiError(401, "Unable to fetch assignments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            `Assignments for ${req.department} department fetched successfully`,
            // filteredAssignments
            assignments
        )
    )

})



export {assetAssignRequest,assetAssign,assetUnAssignRequest,assetUnAssign,getAllForUser,getAssignmentsByAssetId,getAllForDepartment}


/*
TODOs for assignments 
- Need to create an assignment history (as we are not deleting the assets completely now we can reference their data in assignment history)

*/