import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const JWTcheck = asyncHandler(async(req,res,next)=>{

try {
    //We either fetch it from cookies or the header(because in mobile apps we might have this token passed in the header)
    let accessToken = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", "")

    if(!accessToken){
        throw new ApiError(401,"Unauthorized access")  
    }

    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401,"Unauthorized Access")
    }
    req.user = user
    next()
} catch (error) {
    throw new ApiError(500,error?.message || "Access token Invalid")
}
})