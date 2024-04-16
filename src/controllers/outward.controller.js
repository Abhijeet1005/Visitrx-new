import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Outward } from "../models/outward.model.js";
import { Asset } from "../models/asset.model.js";
import { User } from "../models/user.model.js";

const getAllOutwards = asyncHandler(async (req,res)=>{
    const outwards = await Outward.find()

    if(outwards === undefined){
        throw new ApiError(500, "Unable to fetch outward records")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Outwards fetched successfully",
            outwards
        )
    )
})

const outwardCreationRequest = asyncHandler(async (req,res)=>{
    //Here we will take the outward details (assetId in params, rest in body)
    //Create a new email request to security admin to add a new outward entry

    const { id } = req.params

    const { quantity, sendingToContact, sendingToName, details, returnType} = req.body

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    if(!(quantity && sendingToContact && returnType)){
        throw new ApiError(400, "Please fill the necessary fields")
    }

    // fetch asset

    const asset = await Asset.findById(id)

    if(!asset){
        throw new ApiError(401,"Unable to find the asset")
    }

    if(quantity > asset.quantityInStock){
        throw new ApiError(401, "Cannot send more than the quantity in stock")
    }

    const securityAdmin  = await User.findOne({
        role: "SecurityAdmin"
    })

    if(!securityAdmin){
        throw new ApiError(500, "Unable to find the security admin")
    }

    // Create an email with details "Sending x quantity of y asset to k(if sendingToName is provided or person) with contact n"

    const data = {
        assetId: asset._id,
        quantity,
        sendingToContact,
        sendingToName: sendingToName || null,
        details: details || null,
        returnType
    }

    const token = generateToken(data)
    const emailContent = 
    `
    <h1>To verify the sending of ${quantity} of ${asset.productName} to ${sendingToName || "Person"} with contact ${sendingToContact}</h1>
    <br>
    <a href="${process.env.ASSET_TO_SECURITY}/${token}">Click Here</a>
    `
    const emailSubject = "Outward Email";

    const emailSent = await emailer(securityAdmin.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
    }

})

const createOutward = asyncHandler(async (req,res)=>{

    const { assetId, quantity, sendingToContact, sendingToName, details, returnType } = req.tokenData

    // Need to check the fields then create a new outward entry
    
    const asset = await Asset.findById(assetId)

    if(!asset){
        throw new ApiError(401, "Unable to find the asset requested")
    }

    if(quantity > asset.quantityInStock){
        throw new ApiError(401, "Cannot send out more than quantity in stock")
    }

    const outward = await Outward.create({
        assetId,
        quantity,
        sendingToContact,
        sendingToName,
        returnType,
        details
    })

    if(!outward){
        throw new ApiError(500, "Unable to create outward entry")
    }

    asset.quantityInStock = asset.quantityInStock - parseInt(quantity)
    await asset.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Outward created successfully",
            outward
        )
    )
})



export { getAllOutwards, outwardCreationRequest, createOutward }