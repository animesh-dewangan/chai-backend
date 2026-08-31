import {asyncHandler} from "../utils/asyncHandler.js" // curly braces are for named export.
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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


    // STEP-1 User's data has been taken from frontend
    const {username,email,fullName,password} = req.body
    console.log("email: ", email)
    // we can only take data directly, for files like image video we would requierd middlewares


    // STEP-2 Validate data.
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


    
    // STEP-3 Check if user already exist from database. 
    const ExistedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(ExistedUser){
        throw new ApiError(409, "Bad Request -- Username or Email already exist")
    }



    // STEP-4 Check for images or avatar
//     req.files contains === avatar: [
//     {
//       fieldname: 'avatar',
//       originalname: 'Screenshot 2026-07-18 001913.png',
//       encoding: '7bit',
//       mimetype: 'image/png',
//       path: 'public\\temp\\Screenshot 2026-07-18 001913.png',
//       destination: './public/temp',
//       filename: 'Screenshot 2026-07-18 001913.png',
//       size: 153480
//     }
//     ]
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(409, "Bad Request -- Avatar is reqired")
    }



    // STEP-5 Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    // STEP-6 Check if succesfully uploaded on cloudinary
    if(!avatar){
        throw new ApiError(400, "Bad Request -- Avatar is reqired")
    }


    // STEP-7 Create an object and enter it into the db
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })


    // one extra db call to check if user is succesfully created or not
    // STEP-8 remove password and refreshToken from response
    const registeredUser = await User.findById(user._id).select(" -password -refreshToken ")

    if(!registeredUser){
        throw new ApiError(500, "Failed To Register User Please Try Again!!!")
    }


    // STEP-9 return response
    // return ApiResponse(200,registeredUser,"Succesfully Registered..!!!")
    return res.status(201).json(
        new ApiResponse(200, registeredUser, "Succesfully Registered..!!!")
    )
})

export {registerUser}