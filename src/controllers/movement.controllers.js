import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Movement } from "../models/movement.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addMovement =  asyncHandler(async (req,res)=>{

    const { workFor,category,gatePassNo,purpose,permissionBy,remark } = req.body
    let employees;

    if(req.headers["user-agent"].startsWith("PostmanRuntime")){
        employees = JSON.parse(req.body.employees)

    }else{
        employees = req.body.employees;
    }

    if(!employees){
        throw new ApiError(400,"Employee field is required")
    }

    let cloudinaryImage = null;

    if (req.file?.path) {
        const image = req.file.path;
        cloudinaryImage = await uploadOnCloudinary(image);
    }

    const movement =  await Movement.create({
        workFor,
        category,
        gatePassNo,
        purpose,
        permissionBy,
        remark,
        employees,
        image: cloudinaryImage.url
    })

    if(!movement){
        throw new ApiError(500,"Unable to create movement entry")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Movement entry created",
            movement
        )
    )
})

const getAllMovements = asyncHandler(async (req,res)=>{

    const movements = await Movement.find()

    if(movements === undefined){
        throw new ApiError(500,"Unable to fetch movements")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Movements fetched successfully",
            movements
        )
    )
})

const checkIn = asyncHandler(async (req,res)=>{
    const {id} = req.body

    if (!id) {
        throw new ApiError(400, "Please provide movement ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid movement ID");
    }

    const movement = await Movement.findByIdAndUpdate(id,{
        checkIn: new Date().toISOString()
    },{
        new: true
    })

    if(!movement){
        throw new ApiError(401,"Unable to checkIn")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Movement updated successfully",
            movement
        )
    )

})

const deleteMovement = asyncHandler(async (req,res)=>{

    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide movement ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid movement ID");
    }

    const movement = await Movement.findByIdAndDelete(id)

    if(!movement){
        throw new ApiError(500,"Unable to delete movement entry")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Movement entry deleted successfully",
            movement
        )
    )


})

const updateMovement = asyncHandler(async (req,res)=>{

    //Later we can add a filter so that if check in is already done we cant update the entries

    const { id } = req.params

    if (!id) {
        throw new ApiError(400, "Please provide movement ID");
    }

    // Validate ID (ensure it's a string or a valid ObjectId)
    if (typeof id !== "string" && !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid movement ID");
    }

    const { workFor,category,gatePassNo,purpose,permissionBy,remark } = req.body

    const updatedData = {
        workFor,
        category,
        gatePassNo,
        purpose,
        permissionBy,
        remark,
    };

    const movement = await Movement.findByIdAndUpdate(id, updatedData, { new: true });

    if (!movement) {
        throw new ApiError(500, "Movement entry not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Movement updated successfully",
            movement
        )
    )
})

export {addMovement,getAllMovements,checkIn,deleteMovement,updateMovement}