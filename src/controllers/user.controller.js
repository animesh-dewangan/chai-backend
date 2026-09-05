import { asyncHandler } from "../utils/asyncHandler.js" // curly braces are for named export.
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import cookieParser from "cookie-parser"

const registerUser = asyncHandler(async(req, res) => {
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


const loginUser   = asyncHandler(async(req,res) => {
    // req body -> data
    // check for username and email
    // check if user exist
    // check for correct password
    // generate access and refresh token
    // send success for login along with secureCookie with assess and refresh token

    // STEP-1 user credentials from frontend
    const {email,username,password} = req.body

    // STEP-2 checking if it's not empty
    const isEmpty = [email,username,password].some((para) => {
        return (para?.trim() === "")
    }) 
    
    if(isEmpty){
        throw new ApiError(400, "Bad Request -- All paramteres are required to login")
    }

    //STEP-3 check if user exists
    const user = await User.findOne({
        $or:[ {username : username}, {email : email}]
    })

    if(!user){
        throw new ApiError(404, "Bad Request -- Username and Email does not exist")
    }

    // STEP-4 check for correct password
    const isUserPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isUserPasswordCorrect){
        throw new ApiError(401, "Bas Request -- Unauthorised Password is incorrect")
    }

    // STEP-5 generate access and refresh token
    const userAccessToken = user.generateAccessToken();
    const userRefreshToken = await user.generateRefreshToken();

    // we have user but it also contain password ans access token is not been updated to user we have we can add refresh token to user object or make a new db call.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // STEP-6 return response
    const options = {httpOnly:true, secure:true}

    return res.status(200) 
    .cookie("accessToken", userAccessToken, options)
    .cookie("refreshToken", userRefreshToken, options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,userAccessToken,userRefreshToken,
        },
        "User Logged In Successfully..!!"
    ))
    
})


const logoutUser = asyncHandler( async(req,res) => {
    

    await User.findByIdAndUpdate(
        req.user._id,  // find user by it's id
        {
            $set: { // set operator is used to set the value
                refreshToken: undefined
            }
        },
        {
            new: true // new true means in response send me the updated object 
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie("accessToken", options) // we used options as we have set the standards that this cookies will come secured
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})


export {registerUser, loginUser, logoutUser}