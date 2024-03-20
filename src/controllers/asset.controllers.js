import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse}  from "../utils/ApiResponse.js";
import { Asset } from "../models/asset.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//Apply auth check 
const getAllAssets = asyncHandler(async (req,res)=>{

    //Later on we can apply aggregation pagination here for bigger database
    const assets = await Asset.find()

    if(!assets){
        throw new ApiError(500,"Something went wrong on our end")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Assets fetched successfully",
            assets
        )
    )
})

const addAsset = asyncHandler(async(req,res)=>{

    /*
    assets - array of objects with properties name, quantity
    details - details for all assets
    unit - for quantities
    type - of assets
    */

    const {assets, quantity, type, unit, details} = req.body

    if(!(assets && quantity && type)){
        throw new ApiError(400, "Fill the essential fields")
    }

    if(assets.length === 0){
        throw new ApiError(400, "Assets cannot be empty")
    }

    const allAssets = []

    const {assetImagePath} = req.file?.path
    let cloudinaryImage = null

    if(assetImagePath){
        cloudinaryImage = await uploadOnCloudinary(assetImagePath)
    }

    for(const asset of assets){
        const {name,quantity} = asset

        const newAsset = await Asset.create({
            name: name,
            type,
            details,
            quantityInStock: quantity,
            unit,
            assetImage: cloudinaryImage?.url,
            createdBy: req.user._id,
        },
        )

        allAssets.push(newAsset)
    }
    
    return res.status(200)
    .json(new ApiResponse(
        200,
        "Asset created successfully",
        allAssets
    ))

})

export {
    getAllAssets,
    addAsset,
}