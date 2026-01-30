import mongoose from "mongoose";
import { Subscription } from "../models/subscriptions.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";

const toggleSubscription = asyncHandler(async (req,res) => {
    const {channelId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"channelId is not avialable ")
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(400,"channel does not exists");
    }

    const deleteSubscribe = await Subscription.findOneAndDelete({
        channel:channelId,
        subscriber:req.user?._id});

    if(deleteSubscribe){
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "subscriber removed sucessfully"
                )
            )
    }

    const addSubscribe = await Subscription.create({
        channel:channelId,
        subscriber:req.user?._id
    });

    if(!addSubscribe){
        throw new ApiError(400,"subscriber not added yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                addSubscribe,
                "subscriber added sucessfully"
            )
        );
})

const getUserChannelSubcribers = asyncHandler(async (req,res) => {
    const {channelId} = req.params ;
    const userId = req.user._id ;

    if(! mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"channelId is not available ")
    };

    if(! mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is not available ")
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(400,"channel does not exists");
    }


    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber"
            }
        },{
            $unwind:"$subscriber"
        },{
            $project:{
                subscriber:{
                    _id:1,
                    userName:1,
                    fullName:1,
                    avatar:1
                }
            }
        },
        {$sort: {createdAt : -1}},
        {$skip:skip},
        {$limit:limitNumber}
    ]);

    const totalSubscribersCount = await Subscription.countDocuments({
        channel:channelId
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscribers,
                    pagination:{
                        total:totalSubscribersCount,
                        page:pageNumber,
                        limit:limitNumber,
                        totalPages:Math.ceil(totalSubscribersCount / limitNumber)
                    }
                },
                "channel subscribers got successfully"
            )
        );

})

const getSubscribedChannels = asyncHandler(async (req,res) => {
    const userId = req.user?._id ;

    if(! mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is not available ")
    }
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNumber - 1) * limitNumber;


    const subscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel"
            }
        },{
            $unwind:"$channel"
        },{
            $project: {
                _id: 0,
                "channel._id": 1,
                "channel.fullName": 1,
                "channel.userName": 1,
                "channel.avatar": 1,
                createdAt: 1
            }
        },
        {$sort: { createdAt : -1}},
        {$skip:skip},
        {$limit:limit}
    ]);

    const totalSubscribedChannel = await Subscription.countDocuments({
        subscriber:userId
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscribedChannels,
                    pagination:{
                        total:totalSubscribedChannel,
                        page:pageNumber,
                        limit:limitNumber,
                        totalPages: Math.ceil(totalSubscribedChannel / limitNumber)
                    }
                },
                "subscribed channels got successfully"
            )
        );
})

export {toggleSubscription , getSubscribedChannels ,getUserChannelSubcribers};
