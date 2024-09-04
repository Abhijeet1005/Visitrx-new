import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { checkToken } from "../utils/tokenizer.js";
import { redis } from "../db/db.js";

const tokenCheckMiddleware = asyncHandler(async(req,res,next)=>{

    const {token} = req.query
    // const checkForUsed = await Token.findOne({
    //     token: token.toString()
    // })
    const checkForUsed = await redis.get(token.toString())

    if(checkForUsed){
        throw new ApiError(400,"Token already used")
    }

    const decodedToken = checkToken(token)

    if(!decodedToken){
        throw new ApiError(400,"Invalid authentication token")
    }

    // await Token.create({
    //     token: token
    // })
    const tokenExpiry = process.env.REDIS_TOKEN_EXPIRY // Make sure this is greated than token expiry in generateToken function of tokenizer.js util
    await redis.set(token.toString(),token.toString(),"EX",tokenExpiry)

    req.tokenData = decodedToken
    next()
})

export {tokenCheckMiddleware}