//This file will check the role and read for an Admin in the string
//If found it will pass on the req.role with the role of the admin in req
//Other pass and error of not being a valid admin
//This will run after JWTcheck middleware

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const adminDepartment = asyncHandler(async(req,res,next)=>{

try {

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(401,"Unauthorized Access")
    }

    // if(!(user.role === "AppAdmin" || user.role === "AssetAdmin" || user.role === "SecurityAdmin")){
    //     throw new ApiError(500,"Logged in user is not an app or asset admin")
    // }

    let adminCheck = user.role.includes("Admin")
    req.department = null

    if(!adminCheck){
        throw new ApiError(400, "Logged-in user is not an admin")
    }

    req.department = user.role.trim().replace("Admin", "")
    console.log(req.department)

    next()
} catch (error) {
    throw new ApiError(500,error?.message)
}
})