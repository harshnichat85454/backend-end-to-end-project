import {asyncHandler} from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweets.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req , res) => {
    const {content} = req.body ;

    if(!content){
        throw new ApiError(400,"content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })

    const existTweet = await Tweet.findById(tweet._id)

    if(!existTweet){
        throw new ApiError(500,"tweet not created yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet created successfully"
            )
        );
})

const deleteTweet = asyncHandler(async (req , res) => {
    const {tweetId} = req.params ;

    if(!tweetId){
        throw new ApiError(400,"tweet id not available");
    }

    await Tweet.findByIdAndDelete(tweetId);

    const existTweet = await Tweet.findById(tweetId);

    if(existTweet){
        throw new ApiError(400,"tweet not deleted yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "tweet deleted successfully"
            )
        );
})

const updateTweet = asyncHandler(async (req , res) => {
    const {tweetId} = req.params ;

    if(!tweetId){
        throw new ApiError(400,"tweet id not available");
    }

    const {newContent} = req.body ;

    if(!newContent){
        throw new ApiError(400,"new content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, 
        {
        $set:{
            content:newContent
        }
        }, {
            new:true
        }
    );

    if(!tweet){
        throw new ApiError(400,"tweet not updated yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet updated successfully"
            )
        );
})

const getUserTweets = asyncHandler(async (req , res) => {
    const userId = req.user._id ;
    const {page=1 , limit=10} = req.query ;

    if(!userId){
        throw new ApiError(400,"userId is not available");
    }

    const pageNumber = Math.max(parseInt(page,10),1);
    const limitNumber = Math.min(parseInt(limit,10),50);
    const skip = (pageNumber-1)*limitNumber ;

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },{
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },{
            $unwind: "$owner"
        },{
            $project:{
                content:1,
                owner:{
                    _id:1,
                    fullName:1,
                    userName:1,
                    avatar:1
                }
            }
        },
        {$sort: {createdAt : -1}},
        {$skip: skip},
        {$limit: limitNumber}
    ])

    const totalTweets = await Tweet.countDocuments({owner:userId});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweets,
                    pagination:{
                        total:totalTweets,
                        page:pageNumber,
                        limit:limitNumber,
                        totalPages: Math.ceil(totalTweets / limitNumber)
                    }
                }
            )
        )
})

export {createTweet , updateTweet , deleteTweet , getUserTweets}