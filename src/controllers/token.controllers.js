import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { checkToken } from "../utils/tokenizer.js";
import { Token } from "../models/token.model.js";

const tokenCheckMiddleware = asyncHandler(async(req,res,next)=>{
    //This function will verify the token and then call the assetAssign function in asset controller
    const {token} = req.params

    const checkForUsed = await Token.findOne({
        token: token.toString()
    })

    if(checkForUsed){
        throw new ApiError(400,"Token already used")
    }

    const decodedToken = checkToken(token)

    if(!decodedToken){
        throw new ApiError(400,"Invalid authentication token")
    }

    req.tokenData = decodedToken
    next()
    //Expect the directly assigning function after this
})

export {tokenCheckMiddleware}