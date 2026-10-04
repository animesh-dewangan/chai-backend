import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import { asyncHandler } from "../utils/asyncHandler"
import { User } from "../models/user.model"
import { ApiError } from "../utils/ApiError"

const optionalAuthorization = asyncHandler( async(req,_,next) => {
    /* we again wrap it with try and catch because if invalid access token the verifyJWT will throw an error
        we don't want global error handling by async handler so we explicity wrap it to print custom message*/


    /*
        No token:
            Treat request as guest.

        Valid token:
            Authenticate user and attach req.user.

        Invalid/expired token:
            Return 401.
    */
   
    try {
        const encodedaccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!encodedaccessToken){
            return next();
        }
    
        const accessToken = jwt.verify(encodedaccessToken, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(accessToken._id).select("_id username fullName")
    
        if(!user){
            throw new ApiError(401, "Unauthorized accesss, Invalid Access Token")
        }
    
        req.user = user
    
        next();
    } 
    catch (error) {
        console.log("Optional Authorization Fail's")
        throw new ApiError(401, error?.message || "Invalid or expire access token")
    }
})

export { optionalAuthorization }