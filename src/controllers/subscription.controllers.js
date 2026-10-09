import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler( async(req,res) => {
    // TODO: toggle Subscription 
    // it will toggle from unsubscribe <-> subscribe

    const { channelId } = req.params
    const subscriberId = req.user?._id

    const channle = await User.findById(channelId).select("username fullName")

    if(!channle){
        throw new ApiError(400, "Invalid ChannelID")
    }

    if(subscriberId.toString() === channelId){
        throw new ApiError(400, "Cannot subscribe to yourself")
    }

    // const isSubscribed = await Subscription.findOne({
    //     channel : channelId,
    //     subscriber : req.user?._id
    // })

    // const toggledResult = {}

    // if(isSubscribed){ // -> if true then the user is a subscriber -> now unsuscribe 
    //     toggledResult = await Subscription.findByIdAndDelete(isSubscribed._id)
    // }
    // else{ // if false means we didn't find an instance and user was not the subscriber
    //     toggledResult = await Subscription.create({
    //         channel: channelId,
    //         subscriber: req.user?._id
    //     })
    // }


    // if user was a subscrber it will delete the record and unsubscribe it else we won't find and instance and we will create one
    const deleteSubscriber = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: req.user?._id
    })

    let subscription
    let isSubscribed

    if(deleteSubscriber){
        subscription = deleteSubscriber
        isSubscribed = false
    }
    else{
        subscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user?._id
        })
        isSubscribed = true
    }

    res.status(200)
    .json( new ApiResponse(
        200, 
        { subscription, isSubscribed },
        "Subscription button successfully toggled"))
})

const getUserChannelSubscribers = asyncHandler( async(req,res) => {
    // controller will return subscriber list to channel
    const { channelId } = req.params
})

export { toggleSubscription, getUserChannelSubscribers }