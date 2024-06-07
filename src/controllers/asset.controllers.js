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
import { generateQRCode } from "../utils/qr.js";

//Apply auth check
const getAllAssets = asyncHandler(async (req, res) => {
    //Later on we can apply aggregation pagination here for bigger database 
    const assets = await Asset.find({ quantityTotal: { $gt: 0 } });

    if (!assets) {
        throw new ApiError(500, "Something went wrong on our end");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Assets fetched successfully", assets));
});

const getAssetById = asyncHandler(async (req, res) => {

    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide asset ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid asset ID");
    }

    const asset = await Asset.findById(id)

    if (!asset) {
        throw new ApiError(500, "Unable to find asset");
    }

    let qrData = `${process.env.ASSET_DATA_QR}?id=${asset._id}`

    // console.log(qrData)

    let qrCode = await generateQRCode(qrData)

    if(!qrCode){
        qrCode = "data:image/jpeg;base64,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"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Asset fetched successfully",
                [asset,qrCode]
            )
        );
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
    
    if (req.files && req.files?.invoiceImage && req.files?.invoiceImage[0] && req.files?.invoiceImage[0]?.path) {
        const invoiceImagePath = req.files.invoiceImage[0].path;
        cloudinaryInvoiceImage = await uploadOnCloudinary(invoiceImagePath);
    }
    

    
    for (const element of assets) {
        const { productName, quantityTotal, unit, modelNo } = element;

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
            modelNo,
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
            productName: product?.productName,
            returnType: inward?.returnType,
            type: inward?.type,
            details: inward?.details,
            condition: inward?.condition,
            tags: inward?.tags,
            expiryDate: inward?.expiryDate,
            returnDate: inward?.returnDate,
            buyingDate: inward?.buyingDate,
            quantityInStock: product?.quantityTotal,
            quantityTotal: product?.quantityTotal,
            unit: product?.unit,
            modelNo: product?.modelNo,
            invoiceImage: inward?.invoiceImage,
            productImage: inward?.productImage,
            createdBy: inward?.createdBy,
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

    const { productName, quantity, type, unit, modelNo, details, returnType, returnDate, tags, condition, buyingDate, expiryDate } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(id,{
        productName,
        returnType,
        type,
        details,
        quantityInStock: quantity,
        quantityTotal: quantity,
        unit,
        modelNo,
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


export { getAllAssets, addAsset, deleteAssetById, updateAssetById, addAssetFromInward, getAssetById};



