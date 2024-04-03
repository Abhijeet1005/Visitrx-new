import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Asset } from "../models/asset.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/tokenizer.js";
import { emailer } from "../utils/emailer.js";
import { Assignment } from "../models/assignment.model.js";

//Apply auth check
const getAllAssets = asyncHandler(async (req, res) => {
    //Later on we can apply aggregation pagination here for bigger database 
    const assets = await Asset.find();

    if (!assets) {
        throw new ApiError(500, "Something went wrong on our end");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Assets fetched successfully", assets));
});

const addAsset = asyncHandler(async (req, res) => {


    const { type, details, returnType } = req.body;
    let assets;

    if(req.headers["user-agent"] === "PostmanRuntime/7.37.0"){
        assets = JSON.parse(req.body.assets)
        console.log("this executed")
    }else{
        assets = req.body.assets;
    }
    



    if (!(assets && type)) {
        throw new ApiError(400, "Fill the essential fields");
    }

    if (assets.length === 0) {
        throw new ApiError(400, "Assets cannot be empty");
    }

    let allAssets = [];

    console.log(req.files)
    const invoicePhotoPath = req.files?.invoicePhoto[0]?.path;
    const productImagePath = req.files?.productImage[0]?.path;
    let cloudinaryInvoiceImage = null;
    let cloudinaryProductImage = null;


    if (invoicePhotoPath && productImagePath) {
        cloudinaryInvoiceImage = await uploadOnCloudinary(invoicePhotoPath);
        cloudinaryProductImage = await uploadOnCloudinary(productImagePath);
    }
    else{
        throw new ApiError(400,"Invoice and product images are needed")
    }

    for (const element of assets) {
        const { productName, quantityTotal, unit } = element;

        const newAsset = await Asset.create({
            productName,
            returnType,
            type,
            details,
            quantityInStock: quantityTotal,
            quantityTotal: quantityTotal,
            unit,
            invoiceImage: cloudinaryInvoiceImage?.url,
            productImage: cloudinaryProductImage?.url,
            createdBy: req.user._id,
        });

        allAssets.push(newAsset);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Asset created successfully", allAssets));
});

const deleteAssetById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    const asset = await Asset.findByIdAndDelete(id, {
        new: true,
    });

    if (!asset) {
        throw new ApiError(401, "Unable to delete");
    }

    //Later need to add logic to delete all the assignments of this asset

    return res
        .status(200)
        .json(new ApiResponse(200, "Asset deleted successfully", asset));
});

const updateAssetById = asyncHandler(async(req,res)=>{
    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    const { productName, quantity, type, unit, details, returnType } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(id,{
        productName,
        returnType,
        type,
        details,
        quantityInStock: quantity,
        quantityTotal: quantity,
        unit,
    },
    {
        new: true,
    })

    if(!updatedAsset){
        throw new ApiError(500, "Unable to update asset")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Asset updated successfully",
            updatedAsset
        )
    )

})



//Ignore EVERYTHING below or you'll get confused

//This will only check the assignment details and send the email to confirm
// const assetAssignRequest= asyncHandler(async(req,res)=>{
//     const { id } = req.params //Id of asset
//     const { email , quantity} = req.body //User email and quantity to be assigned

//     if (!id) {
//         throw new ApiError(400, "Please provide asset ID");
//     }

//     // Validate ID (ensure it's a string or a valid ObjectId)
//     if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
//         throw new ApiError(400, "Invalid asset ID");
//     }

//     if(!email){
//         throw new ApiError(400,"Email cannot be empty")
//     }

//     if(!email.includes('@')){
//         throw new ApiError(401,"Enter valid email")
//     }

//     const user = await User.findOne({
//         email: email,
//     }).select("-password -refreshToken")

//     const asset = await Asset.findById(id)

//     if(!user){
//         throw new ApiError(401,"User doesn't exist")
//     }

//     if(!asset){
//         throw new ApiError(401,"Asset doesn't exist")
//     }

//     if(!(quantity <= asset.quantityInStock)){
//         throw new ApiError(401,"Cannot assign items more than the quantity in stock")
//     }

//     //Generating tokens after detail verification
//     const data = {
//         assetId: asset._id,
//         userId: user._id,
//         quantity
//     }
//     const token = generateToken(data)
//     const emailContent = 
//     `
//     <h1>To verify the assignment of ${quantity} of ${asset.name}</h1>
//     <br>
//     <a href="${process.env.ASSET_TO_USER}/${token}" > Click here </a>
//     `
//     const emailinfo = await emailer(user.email,emailContent)

//     if(emailinfo){
//         return res.status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 "Email sent successfully",
//                 null
//             )
//         )
//     }else{
//         throw new ApiError(500,"Something happened on our end while sending the email")
//     }

// })


// const assetAssign = asyncHandler(async(req,res)=>{
    
//     const {assetId, userId, quantity} = req.assignmentData

//     const asset = await Asset.findById(assetId)
//     if(!asset){
//         throw new ApiError(500,"Unable to fetch the asset requested")
//     }

//     const assigned = await Assignment.create({
//         assetAssigned: assetId,
//         assignedTo: userId,
//         quantityAssigned: quantity
//     })
//     if(!assigned){
//         throw new ApiError(500,"Some error happened while assigning the asset")
//     }

//     asset.quantityInStock = asset.quantityInStock - parseInt(quantity)

//     return res.status(200)
//     .json(
//         new ApiResponse(
//             200,
//             "Asset assigned successfully",
//             assigned
//         )
//     )

// })

export { getAllAssets, addAsset, deleteAssetById, updateAssetById,};
