import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler( async(req,res) => {
    // TODO get all videos based on queries,sort or pagination

    const { page = 1, limit = 10, category, search, sortBy, sortType, userId } = req.query

    const filter = {}

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
    /* step 1 -> get a video from user 
        step 2 -> upload video from server to cloudinary
        step 3 -> create a video instance in db and have all it's detail
        step 4 -> send response*/
    
    const { video, thumbnail, title, description, user } = req.body

    const parameterRequired = [video, thumbnail, title, description].some((value) => {
        return value?.trim() === ""
    })

    if(parameterRequired){
        throw new ApiError(400, "All Video Fiels are necessary for uploadig..!!")
    }
})  


export { getAllVideos, publishAVideo }