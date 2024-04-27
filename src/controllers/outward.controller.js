import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Outward } from "../models/outward.model.js";
import { Asset } from "../models/asset.model.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/tokenizer.js";
import { emailer } from "../utils/emailer.js";

const getAllOutwards = asyncHandler(async (req,res)=>{

    //Need to replace this with a pipeline having assets populated along with their IDs
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

    // const { id } = req.params
    const { id } = req.body

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
    <a href="${process.env.ASSET_TO_SECURITY}?token=${token}">Click Here</a>
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

    //If the outward is non returnable then we want to reduce its quantity so that it doesn't get reflected in the system later on
    //and we only keep tracking the ones in stock or assigned
    if(returnType === "Non-Returnable"){
        asset.quantityTotal = asset.quantityTotal - parseInt(quantity)
    }
    await asset.save()

    //And we can generate a tag with the ID of outward entry, this can act as a unique receipt that borrower will carry with the article
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Outward created successfully",
            outward
        )
    )
})

const outwardReturnRequest = asyncHandler(async (req,res)=>{
    //This will only be triggered from SecurityAdmin
    /*
    - Will receive a check(with current date,time) from frontent for an outward record
    - Then we will read the details from the record and send an email to AssetAdmin, if confirmed we update outward record with date,time
    - and update the asset's in-stock and total quantities

    **For now we will only accept the return with same quantities as when we sent them, but in future we can implement partial returns
    */
   
    // const { id } = req.params //This will be the outward ID
    const { id } = req.body

    const { currentDateTime } = req.body

    if(!currentDateTime){
        throw new ApiError(400, "Date and time of return are required")
    }

    if(!id) {
        throw new ApiError(400, "Please provide outward record ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid outward record ID");
    }

    const outward = await Outward.findById(id)

    if(!outward){
        throw new ApiError(401, "Unable to find the outward record")
    }

    if(outward.returnType === "Non-Returnable"){
        throw new ApiError(401, "Cannot return a non-returnable asset")
    }

    const asset = await Asset.findById(outward.assetId)

    if(!asset){
        throw new ApiError(401,"The asset record doesn't exist")
    }

    const assetAdmin = await User.findOne({
        role: "AssetAdmin"
    })

    const data = {
        returnDateTime: currentDateTime,
        outwardId: outward._id
    }

    const token = generateToken(data)
    const emailContent = 
    `
    <h1>To verify the return of ${outward.quantity} of ${asset.productName} by ${ outward.sendingToName || " a Person"} with contact ${outward.sendingToContact}</h1>
    <br>
    <a href="${process.env.OUTWARD_RETURN}?token=${token}">Click Here</a>
    `
    const emailSubject = "Outward Return Email";

    const emailSent = await emailer(assetAdmin.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
    }

})

const outwardReturn = asyncHandler(async (req,res)=>{
    const {returnDateTime, outwardId} = req.tokenData

    if(!(returnDateTime, outwardId)){
        throw new ApiError(400, "Unable to verify request")
    }
    
    const outward = await Outward.findById(outwardId)

    if(!outward){
        throw new ApiError(401, "Unable to find the outward entry")
    }

    const asset = await Asset.findById(outward.assetId)

    if(!asset){
        throw new ApiError(401, "Unable to fetch the asset details")
    }

    asset.quantityInStock = asset.quantityInStock + parseInt(outward.quantity)
    // asset.quantityTotal = asset.quantityTotal + parseInt(outward.quantity)
    await asset.save()

    outward.returnDate = returnDateTime
    await outward.save()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Outward Return successfull",
            asset
        )
    )
})



export { getAllOutwards, outwardCreationRequest, createOutward, outwardReturnRequest, outwardReturn }