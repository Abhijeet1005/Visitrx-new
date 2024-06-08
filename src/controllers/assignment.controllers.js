import mongoose from "mongoose"
import { Asset } from "../models/asset.model.js"
import { Assignment } from "../models/assignment.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { emailer } from "../utils/emailer.js"
import { generateToken } from "../utils/tokenizer.js"
import { generateQRCode } from "../utils/qr.js"

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
        return doc.assignedTo && doc.assignedTo.role === `${req.department}Head`;
    });

    if(!assignments){
        throw new ApiError(401, "Unable to fetch assignments")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            `Assignments for ${req.department} department fetched successfully`,
            filteredAssignments,
            // assignments
        )
    )

})

const getAllAssignments = asyncHandler(async (req,res)=>{
    const assignments = await Assignment.find();

    if(!assignments){
        throw new ApiError(401, "Unable to fetch assignments")
    }

    return res.json(
        new ApiResponse(
            200,
            "Assignments fetched successfully",
            assignments
        )
    )
})

const getAssignmentById = asyncHandler(async (req,res)=>{
    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide assignment ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid assignment ID");
    }

    const assignment = await Assignment.findById(id)

    if(!assignment){
        throw new ApiError(401,"Unable to find assignment")
    }

    let qrData = `${process.env.QR_VERIFY}?id=${assignment._id}`

    let qrCode = await generateQRCode(qrData)

    if(!qrCode){
        qrCode = "data:image/jpeg;base64,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"
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Assignment fetched successfully",
            [assignment,qrCode]
        )
    )

})



export {assetAssignRequest,assetAssign,assetUnAssignRequest,assetUnAssign,getAllForUser,getAssignmentsByAssetId,getAllForDepartment,getAllAssignments,getAssignmentById}


/*
TODOs for assignments 
- Need to create an assignment history (as we are not deleting the assets completely now we can reference their data in assignment history)

*/