import jwt from "jsonwebtoken";

const generateToken = (data,expiry="1d")=>{
    return jwt.sign(data,process.env.JWT_SECRET,{
        
        expiresIn: expiry //This decides the token expiration
    })
}

const checkToken = (token)=>{
    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

        return decodedToken
    } catch (error) {
        return {
            message: "Invalid Token",
            error: error?.message
        }
    }
}

export {generateToken,checkToken}
