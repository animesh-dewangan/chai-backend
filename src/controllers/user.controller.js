import { asyncHandler } from "../utils/asyncHandler.js" // curly braces are for named export.
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'
import { Subscription } from "../models/subscription.model.js"

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

    // ! loginUser does not accept form input rn as multer is not used in middleware to parse and make it multipart data

    // STEP-1 user credentials from frontend
    const { email, username, password } = req.body

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

    // we have user but it also contain password and access token is not been updated to user we have
    // we can add refresh token to user object or make a new db call.
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
    // how to logout user we have two task one to remove refresh token from db
    // and second to remove access and refresh tokens cookies from req res.

    await User.findByIdAndUpdate(
        req.user._id,  // find user by it's id 
        { $set: { refreshToken: undefined } },  // set operator is used to set the value
        // { returnDocument: "after" }  // find and update usually return old instance this make sure it return after updating
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    // we don't need to import cookie parser for .clearCookie method it is provided by express for response object
    // normal response includes cookies so to logout user we need to remove this cookies and if the user 
    // will not send cookies the server nolonger knows him
    res.status(200)
    .clearCookie("accessToken", options) // we used options as we have set the standards that this cookies will come secured
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})


const refreshAccessToken = asyncHandler( async(req, res) => {
    // flow of generating access token.
    // we were using authentication middleware to authinticate user and add an object called user to perform operations
    // when access token get expired authintication fails and insted or directly giving error it checks for refresh token.
    // first check if it has a refresh token
    // then check if it's correct or not have it been tampered
    // then user the user._id to call user instance from db
    // check if db refresh token matches with the incoming one
    // then generate new token update to db and return response with access token 
    
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request, Invalid Refresh Token")
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedRefreshToken?._id).select(" -password ")

    if(!user){
        throw new ApiError(401, "Invalid Refresh Token")
    }
    
    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Unauthorized request, Request Token is Expired or Used")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    const updatedUser = await User.findById(user._id).select(" -password -refreshToken ")

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(ApiResponse(
        200,
        {
            user: updatedUser,accessToken,refreshToken
        },
        "Successfully genereted Access token from refresh Token"
    ))
})


const changeUserPassword = asyncHandler( async(req, res) => {
    // flow of changing password 
    // since user is req for change of passsword he must be logged in so we will use verifyJwt to validate user and add user object to req
    // if user is valid then we will check for old password and new password in req.body
    // make a db call and will check if old password is correcct or not
    // then bcrypt the new password and update it to db and return response

    const { oldPassword, newPassword } = req.body
    
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Old and New passwords are Required")
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Unauthorized request, Old password is incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave : false }) //validateBeforeSave is used to skip the validation checks on the user model schema fiels like is it stirg, required and other checks

    return res.status(200)
    .json(new ApiResponse(200, {}, "password is updated successfully"))
})


const getCurrentUser = asyncHandler( async(req, res) => {
    // we can use verifyJWT middleware to validate credentials and get the user object

    return res.status(200).
    json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})


const updateAccountDetails = asyncHandler( async(req, res) => {

    const {username, fullName, email} = req.body

    if(username === undefined && fullName === undefined && email === undefined){
        throw new ApiError(400, "Bad Request -- Atleast one parameter is required to update")
    }

    if(email !== undefined && !email.includes('@')){
        throw new ApiError(400, "Bad request -- Invalid email")
    }

    // const user = await User.findById(req.user._id)

    // if(username !== undefined && username !== user.username){ // if there is a username and it's not same update it 
    //     user.username = username
    // }
    // if(email !== undefined && email !== user.email){ // if there is a email and it's not same update it
    //     user.email = email
    // }
    // if(fullName !== undefined && fullName !== user.fullName){ // if there is a fullName and it's not same update it
    //     user.fullName = fullName
    // }

    // await user.save();


    // or maybe another way to update the user details 

    const toUpdate = {}
    if(username !== undefined) toUpdate.username = username
    if(email !== undefined) toUpdate.email = email
    if(fullName !== undefined) toUpdate.fullName = fullName

    const updatedUser = await findUserByIdAndUpdate(req.user?._id,
        {$set: toUpdate},
        {returnDocument: "after", runValidators: true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json(new ApiResponse(200, updatedUser, "User account details updated successfully"))
})


const updateUserAvatar = asyncHandler( async(req, res) => {
    // we must have used multer middleware to parese/accept files from from frontend
    // normal express does no accept files so we need to use multer middleware to accept files 
    // we will also check if the user is logged in or not using verifyJWT middleware
    // we have done One mistake --> we didn't delete the old avatar from cloudinary

    const avatarLocalPath = req.file?.avatar?.path || ""
    if(!avatarLocalPath){
        throw new ApiError(400, "Bad Request -- Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(500, "Failed to Upload Avatar on Cloudinary")
    }

    const userAvatar = await User.findById(req.user._id).select("avatar")

    const updatedUser = await User.findByIdAndUpdate(req.user._id,
        {$set: {avatar: avatar.url}},
        {returnDocument: "after", runValidators: true}
    ).select("-password -refreshToken")

    if(await deleteFromCloudinary(userAvatar?.avatar)){  // we can delete old version from cloudinary
        throw new ApiError(500, "failed to delete old avatar from cloudinary")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar Successfully Updated"))
})


const getUserChannelProfile = asyncHandler( async(req,res) => {
    // now initially we get username and other informations from body or cookies 
    // but now we will get username from params and other details from db 
    // like if user want's to see other user's profile then he will send username in params and we will get user details from db

    const { username } = req.params

    if(!username?.trim()){
        throw new ApiError(400,"Bad Request-- Username is missing")
    }

    // aggregation pipelines to get the user informations from the db
    // pipeline return an array of objects
    const channel = await User.aggregate([
        {
            $match: { username : username?.toLowerCase()}
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        }, 
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribers: 1,
                subscribedTo: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])


    if(!channel?.length){ // if the length of array is "0"
        throw new ApiError(401, "User channel does not exist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    )
})


const getWatchHistory = asyncHandler( async(req,res) => {
    
})

export {registerUser,
        loginUser, 
        logoutUser, 
        refreshAccessToken, 
        changeUserPassword, 
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        getUserChannelProfile,
        getWatchHistory
        }