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

const getLikedVideos = asyncHandler(async (req,res) => {

})

export {toggleCommentike , toggleTweetLike , toggleVideoLike , getLikedVideos};