import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler( async(req,res) => {
    // TODO get all videos based on queries,sort or pagination

    const { page = 1, limit = 10, category, search, sortBy, sortType, userId } = req.query

    const filter = {isPublic: true}

    if(category){
        filter.category = category
    }
    /* if search option is given then we add an attribute in filter object title and title 
    value -> is aggrigate operations to search that topic */
    if(search){
        filter.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i"
                }   
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            }
        ]
    }

    const sort = {}

    if(sortBy){
        sort[sortBy] = sortType === "desc" ? -1 : 1
    }

    // calculate the number of responses to skip
    const pageLimit = Number(limit)
    const pageSize = Number(page)

    const toSkip = (pageSize-1)*pageLimit

    const videos = await Video.find(filter)
                                .sort(sort)
                                .skip(toSkip)
                                .limit(pageLimit)

    if(!videos?.length){
        throw new ApiError(400,"No Video's Found...!")
    }

    res.status(200).
    json(new ApiResponse(200,videos,"Videos Found Successfully"))
})

const publishAVideo = asyncHandler( async(req,res) => {
    // TODO: get video, upload to cloudinary, create video

    /* step 1 -> get a video from user 
        step 2 -> upload video from server to cloudinary
        step 3 -> create a video instance in db and have all it's detail
        step 4 -> send response*/
    
    // check for field's
    const { title, description } = req.body

    const parameterRequired = [title, description].some((value) => {
        return value?.trim() === ""
    })

    if(parameterRequired){
        throw new ApiError(400, "All Video Fiels are necessary for uploadig..!!")
    }

    // check if there is a video uploaded with the help of multer
    const videoLocalPath = req.files?.video?.[0]?.path
    const thumbnailLoaclPath = req.files?.thumbnail?.[0]?.path

    if(!videoLocalPath){
        throw new ApiError(400, "Video is Required.!")
    }
    if(!thumbnailLoaclPath){
        throw new ApiError(400, "Thumbnail is Required..!")
    }

    const coludinaryVideo = await uploadOnCloudinary(videoLocalPath)
    const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLoaclPath)

    if(!coludinaryVideo){
        throw new ApiError(500, "Fail's to upload video on cloudinary")
    }
    if(!cloudinaryThumbnail){
        throw new ApiError(500,"Fail's to upload thumbnail on cloudinary")
    }

    const video = await Video.create({
        videoFile: coludinaryVideo.secure_url,
        thumbnail: cloudinaryThumbnail.secure_url,
        title, 
        description,
        duration: coludinaryVideo.duration,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(400, "Failed to upload please try again..")
    }

    res.status(201)
    .json( new ApiResponse(201, video, "Video is successfully uploaded"))
})  

const getVideoById = asyncHandler( async(req, res) => {
    //TODO: get video by id

    const { videoId } = req.params
    const user = req.user 

    if(!videoId){
        throw new ApiError(400, "VideoId is Required")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid VideoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video is not available..!")
    }

    if(!(video.isPublic) && !(user)){ // private video and user not logedIn
        throw new ApiError(400, "Unauthorized request")
    }

    res.status(200)
    .json( new ApiResponse(200, video, "Video Found Successfully"))
})

const updateVideo = asyncHandler( async(req, res) => {
    // TODO - update video details like title discription and thumbnail

    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLoaclPath = req.file?.thumbnail?.[0]?.path

    if(!videoId){
        throw new ApiError(400, "User Id is required to update")
    }

    const isRequired = [title, description, thumbnailLoaclPath].some((value) => Boolean(value?.trim()))

    if(!isRequired){
        throw new ApiError(400, "Atlest one updating parameter required")
    }

    let thumbnail = null
    if(thumbnailLoaclPath){
        thumbnail = await uploadOnCloudinary(thumbnailLoaclPath)
    }

    const toUpdate = {}
    if(description) toUpdate.description = description
    if(title) toUpdate.title = title
    if(thumbnail) toUpdate.thumbnail = thumbnail.secure_url

    const newVideo = await Video.findOneAndUpdate
                            (
                                {
                                    _id: videoId,
                                    owner: req.user._id
                                },
                                { $set: toUpdate },
                                {
                                    new: true,
                                    runValidators: true
                                }) 
    
    if(!newVideo){
        throw new ApiError(400,"Video Not found")
    }

    res.status(200)
    .json(new ApiResponse(200,newVideo,"Video Updated Successfully..!!"))
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo }