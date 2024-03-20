//Imports
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse}  from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";


const generateTokens = async function(user){
    //we have passed the user here to avoid making another database call

    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong on our end")
    }

}

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler( async (req,res)=>{
    const {fullname,email,password,role} = req.body


    //check that required fields are not empty 
    if(!(fullname && email && password)){
        throw new ApiError(400,"All fields are required")
    }

    //Checks if someone passes the wrong role
    if(role?.toString() === "AppAdmin"){
        throw new ApiError(400,"Admin cannot be assigned through this")
    }

    if(!email.includes('@')){
        throw new ApiError(400,"Enter valid email")
    }

    //db query for existing user
    const existingUser = await User.findOne({
        email: email,
    })

    if(existingUser){
        throw new ApiError(409, "username already taken")
    }

    const user = await User.create({
        fullname,
        email,
        password,
        role,
    })
    
    //Now we send data of the newly created use but excluding the password and refresh token
    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Unable to create the user")
    }

    //Now we will send a proper built response using the ApiResponse class to serve a uniform response every time 
    return res.status(201).json(
        new ApiResponse(200,"User created successfully",createdUser)
    )
})

const loginUser = asyncHandler( async (req,res)=>{
    const {email, password} = req.body
    
    if(!email){
        throw new ApiError(401,"Email is required")
    }

    let user = await User.findOne({
        email: email,
    })
    
    if(!user){
        throw new ApiError(404,"User not found")
    }

    const checkPass = await user.isPasswordCorrect(password)

    if(!checkPass){
        throw new ApiError(401,"Re-check the credentials")
    }

    //Now we will generate the Acc and Ref tokens and send the Acc and Ref back to user
    const {accessToken,refreshToken} = await generateTokens(user)

    //Getting the same user without the password and refreshToken included
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
    .cookie("accessToken",accessToken, cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            "Logged in successfully",
            {
                user: loggedInUser,accessToken,refreshToken,
            }
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{

    //JWT authentication middleware is applied in routes to add a req.user
    //We fetch the user ID from the req.user passed then update its refreshToken 
    const loggedOutUser = await User.findByIdAndUpdate(req.user._id,{

        //After unset we also need to remove the password field from the fetched object
        $unset:{
            refreshToken: 1,
        }
    },
    {
        new: true,
        select: "-password" //Un-selects the password on new object fetch
    }
    )

    // Then we also delete the cookies to properly logout the user
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(
        200,"Logged out successfully",loggedOutUser
    ))
})

const getUser = asyncHandler(async (req,res)=>{
    if(!req.user){                                         //This check isnt necessary
        throw new ApiError(400, "Unable to find user")
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        "User found",
        req.user
    ))
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//This method will be ran if the access token is invalid in the JWTcheck middleware and then we will check for refresh token validity and reset both the tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {registerUser,loginUser,logoutUser,getUser,changeCurrentPassword,refreshAccessToken}
