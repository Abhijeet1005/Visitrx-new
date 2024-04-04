import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const SecurityAdmincheck = asyncHandler(async(req,res,next)=>{

try {

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(401,"Unauthorized Access")
    }

    if(!(user.role === "AppAdmin" || user.role === "SecurityAdmin")){
        throw new ApiError(500,"Logged in user is not an app or security admin")
    }

    next()
} catch (error) {
    throw new ApiError(500,error?.message)
}
})