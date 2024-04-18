import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Asset } from "../models/asset.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/tokenizer.js";
import { emailer } from "../utils/emailer.js";
import { Assignment } from "../models/assignment.model.js";
import { Inward } from "../models/inward.model.js";

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


    const { type, details, returnType, condition, tags, expiryDate, returnDate, buyingDate} = req.body;
    let assets;

    if(req.headers["user-agent"].startsWith("PostmanRuntime")){
        assets = JSON.parse(req.body.assets)
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


    let cloudinaryInvoiceImage = null;
    let cloudinaryProductImage = null;

    if (req.files && req.files?.productImage && req.files?.productImage[0] && req.files?.productImage[0]?.path) {
        const productImagePath = req.files.productImage[0].path;
        cloudinaryProductImage = await uploadOnCloudinary(productImagePath);
    }
    
    if (req.files && req.files?.invoicePhoto && req.files?.invoicePhoto[0] && req.files?.invoicePhoto[0]?.path) {
        const invoicePhotoPath = req.files.invoicePhoto[0].path;
        cloudinaryInvoiceImage = await uploadOnCloudinary(invoicePhotoPath);
    }
    

    
    for (const element of assets) {
        const { productName, quantityTotal, unit } = element;

        const newAsset = await Asset.create({
            productName,
            returnType,
            type,
            details,
            condition,
            tags,
            expiryDate,
            returnDate,
            buyingDate,
            quantityInStock: quantityTotal,
            quantityTotal: quantityTotal,
            unit,
            invoiceImage: cloudinaryInvoiceImage?.url || null,
            productImage: cloudinaryProductImage?.url || null,
            createdBy: req.user._id,
        });

        allAssets.push(newAsset);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Asset created successfully", allAssets));
});

const addAssetFromInward = asyncHandler(async (req,res)=>{
    
    const { inwardId } = req.tokenData
    

    if (!inwardId) {
        throw new ApiError(400, "No ID found in request");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof inwardId !== "string" && !mongoose.Types.ObjectId.isValid(inwardId)) {
        throw new ApiError(400, "Got invalid ID from token");
    }

    //Asset addition logic here

    const inward = await Inward.findById(inwardId)

    let allAssets = []
    for(let product of inward.assets){

        const newAsset = await Asset.create({
            productName: product.productName,
            returnType: inward.returnType,
            type: inward.type,
            details: inward.details,
            condition: inward.condition,
            tags: inward.tags,
            expiryDate: inward.expiryDate,
            returnDate: inward.returnDate,
            buyingDate: inward.buyingDate,
            quantityInStock: product.quantityTotal,
            quantityTotal: product.quantityTotal,
            unit: inward.unit,
            invoiceImage: inward.invoiceImage,
            productImage: inward.productImage,
            createdBy: inward.createdBy,
        });

        if(!newAsset){
            throw new ApiError(500, "Unable to create asset entry")
        }

        inward.assetReference.push(newAsset?._id)
        await inward.save()
        allAssets.push(newAsset)
    }

    if(!(allAssets.length === inward.assets.length)){
        throw new ApiError(500, "Something happened while vreating assets")
    }
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Assets Created",
            allAssets
        )
    )
   
})

const deleteAssetById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    // Instead of deleting the entry we are setting its stock to 0, so if there were any assignments related to this asset they can still be returned
    const asset = await Asset.findByIdAndUpdate(
        id,
        {
            quantityInStock: 0,
            quantityTotal: 0
        },
        {
            new: true
        }
    )

    if (!(asset.quantityInStock === 0 && asset.quantityTotal === 0)) {
        throw new ApiError(401, "Unable to delete");
    }

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

    const { productName, quantity, type, unit, details, returnType, returnDate, tags, condition, buyingDate, expiryDate } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(id,{
        productName,
        returnType,
        type,
        details,
        quantityInStock: quantity,
        quantityTotal: quantity,
        unit,
        returnDate,
        expiryDate,
        buyingDate,
        tags,
        condition,
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


export { getAllAssets, addAsset, deleteAssetById, updateAssetById, addAssetFromInward};



