import mongoose, { mongo } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { Video } from "../models/videos.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import { Like } from "../models/likes.model.js";

const getChannelStats = asyncHandler(async (req ,res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const channelExists = await User.exists({ _id: channelId });
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId);

    const [videoStats,
        subscribersCount,
        likeStats] = await Promise.all([
            // 📹 Videos + Views
            Video.aggregate([
                {
                    $match:{
                        owner: channelObjectId,
                        isPublished:true
                    }
                },{
                    $group:{
                        _id:null,
                        totalVideos: {$sum:1},
                        totalViews: {$sum: "$views"}
                    }
                }
            ]),

            // 👥 Subscribers
            Subscription.countDocuments({
                channel:channelId
            }),

            // ❤️ Likes on channel videos
            Like.aggregate([
                {
                    $lookup:{
                        from:"videos",
                        localField:"video",
                        foreignField:"_id",
                        as:"video"
                    }
                },{
                    $unwind: "$video"
                },{
                    $match:{
                        "video.owner": channelObjectId
                    }
                },{
                    $group:{
                        _id:null,
                        totalLikes: {$sum: 1}
                    }
                }
            ])
        ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos: videoStats[0].totalVideos || 0,
                    totalViews : videoStats[0].totalLikes || 0,
                    totalSubscribers : subscribersCount ,
                    totalLikes : likeStats[0].totalLikes || 0
                },
                "Channel stats fetched successfully"
            )
        )
})

const getChannelVideos = asyncHandler(async (req ,res) => {
    const {channelId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"channelId not available");
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(400,"chanel not exist");
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNumber - 1) * limitNumber;


    const channelVideos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true
            }
        },{
            $project:{
                _id:0,
                file:1,
                thumbnail:1,
                title:1,
                description:1,
                duration:1,
                views:1
            }
        },
        {$sort: {createdAt : -1}},
        {$skip:skip},
        {$limit:limitNumber}
    ]);

    const totalChannelVideos = await Video.countDocuments({
        owner:channelId,
        isPublished:true
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    channelVideos,
                    pagination:{
                        total:totalChannelVideos,
                        page:pageNumber,
                        limit:limitNumber,
                        totalPages: Math.ceil(totalChannelVideos / limitNumber)
                    }
                },
                "subscribed channels got successfully"
            )
        );
})

export {getChannelStats , getChannelVideos};