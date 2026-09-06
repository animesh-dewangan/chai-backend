import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


// the request when comes to server it first verify's that the right person is requesting the services
const verifyJWT = asyncHandler(async(req,_,next) => { // we can give underscore to field not used industry standard

    try {
        // req.header is used when the req comes from mobiles 
        const encodedAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!encodedAccessToken){ // if we didn't recieve a token in the request
            throw new ApiError(401, "Unauthorized request")
        }

        // usually fails when the token got tampered or malacious user try requesting the service jwt will itself throw the error
        const accessToken = jwt.verify(encodedAccessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(accessToken._id).select("-password -refreshToken")

        if(!user){ // if we coudn't find the user in the db
            throw new ApiError(401, "Something went wrong Invalid Access Token")
        }

        req.user = user; // we added the user object in the req from middle ware
        next()    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token") // Unauthorized access
    }

})

export { verifyJWT }