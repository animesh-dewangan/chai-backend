import {asyncHandler} from "../utils/asyncHandler.js" // curly braces are for named export.
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler( async(req, res) => {
    // user ko register krne k liye kya kya steps follow krne padenge.

    // get user details from frontend.
    // data ko validate kro.
    // check if user already exist from username or email.
    // check for images -- check for avatar.
    // upload avatar to cloudinary.
    // check if succesfully uploaded to cloudinary
    // create user object -- create entry in db
    // password aur refresh token ko remove kroo response se.
    // check for user creation.
    // return response.


    // step-1 User's data has been taken from frontend
    const {username,email,fullName,password} = req.body
    console.log("email: ", email)
    // we can only take data directly, for files like image video we would requierd middlewares


    // step-2 Validate data.
    // here i will use advance code to check all the entry that they are not empty insted of checking them one by one
    const isParameterEmpty = [username, email, fullName, password].some((parameter) => {
        // .some func returns true if any one is true
        return (parameter?.trim() === "") 
    })
    if(isParameterEmpty){
        throw new ApiError(400, "Bad request -- All parameters are required")
    }
    if(!email.includes("@")){
        throw new ApiError(400, "Bad request -- Invalid email")
    }


    
    // step-3 Check if user already exist from database. 
    if(User.findOne({
        $or: [{ username }, { email }]
    })){
        throw new ApiError(409, "Bad Request -- Username or Email already exist")
    }


    // step-4 Check for images or avatar
    // res.files?.avatar[0]?.path
    console.log(req.files)

})

export {registerUser}