import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";


const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"videoId is wrong");
    }

    const deleteLike = await Like.findOneAndDelete({
        video:videoId,
        likedBy:req.user._id
    });

    if(deleteLike){
        return res  
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "like deleted"
                )
            );
    }

    const newLike = await Like.create({
        video:videoId,
        likedBy:req.user._id
    });

    if(!newLike){
        throw new ApiError(400,"liked not toggled yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "like created"
            )
        )
});

const toggleCommentike = asyncHandler(async (req,res) => {
    const {commentId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"commentId is wrong");
    }

    const deleteLike = await Like.findOneAndDelete({
        comment:commentId,
        likedBy:req.user._id
    });

    if(deleteLike){
        return res  
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "like deleted"
                )
            );
    }

    const newLike = await Like.create({
        comment:commentId,
        likedBy:req.user._id
    });

    if(!newLike){
        throw new ApiError(400,"liked not toggled yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "like created"
            )
        )
});

const toggleTweetLike = asyncHandler(async (req,res) => {
    const {tweetId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId is wrong");
    }

    const deleteLike = await Like.findOneAndDelete({
        tweet:tweetId,
        likedBy:req.user._id
    });

    if(deleteLike){
        return res  
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "like deleted"
                )
            );
    }

    const newLike = await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    });

    if(!newLike){
        throw new ApiError(400,"liked not toggled yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newLike,
                "like created"
            )
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $ne: null }
            }
        },

        { $sort: { createdAt: -1 } },

        { $skip: skip },
        { $limit: limitNumber },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },

        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $project: {
                _id: 0,
                likedAt: "$createdAt",
                video: {
                    _id: "$video._id",
                    title: "$video.title",
                    description: "$video.description",
                    thumbnail: "$video.thumbnail",
                    videoFile: "$video.videoFile",
                    views: "$video.views",
                    duration: "$video.duration",
                    createdAt: "$video.createdAt",
                    owner: {
                        _id: "$owner._id",
                        userName: "$owner.userName",
                        fullName: "$owner.fullName",
                        avatar: "$owner.avatar"
                    }
                }
            }
        }
    ]);

    const totalLikedVideos = await Like.countDocuments({
        likedBy: userId,
        video: { $ne: null }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: likedVideos,
                pagination: {
                    total: totalLikedVideos,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(totalLikedVideos / limitNumber)
                }
            },
            "Liked videos fetched successfully"
        )
    );
});


export {toggleCommentike , toggleTweetLike , toggleVideoLike , getLikedVideos};