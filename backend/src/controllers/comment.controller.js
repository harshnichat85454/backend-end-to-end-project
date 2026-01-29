import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req,res) => {
    const {videoId} = req.params ;
    const {page=1 , limit=10} = req.query ;

    if(!videoId){
        throw new ApiError(400,"video id not available")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"videoId is wrong");
    }

    const pageNumber = Math.max(parseInt(page,10),1);
    const limitNumber = Math.min(parseInt(limit,10),50);
    const skip = (pageNumber-1)*limitNumber;

    const comments = await Comment.aggregate([
        {
            $match: {
                video:new mongoose.Types.ObjectId(videoId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },{
            $unwind: "$owner"
        },{
            $project:{
                content:1,
                createdAt:1,
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
        {$limit:limitNumber}
    ]);

    const totalComment = await Comment.countDocuments({
        video:videoId
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    comments,
                    pagination:{
                        total: totalComment,
                        page : pageNumber,
                        limit : limitNumber ,
                        totalPages : Math.ceil(totalComment / limitNumber)
                    }
                },
                "Video Comment displayed successfully"
            )
        )

})

const addComment = asyncHandler(async (req,res) => {
    const { videoId } = req.params ;

    if(!videoId){
        throw new ApiError(400,"video Id not available");
    }

    const {content} = req.body;

    if(!content){
        throw new ApiError(400,"Comment cannot be empty");
    }

    const comment = await Comment.create({
        content,
        owner:req.user._id,
        video:videoId
    })

    const existComment = await Comment.findById(comment._id);

    if(!existComment){
        throw new ApiError(400,"comment not added");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment added successfully"
            )
        )
})

const updateComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params ;

    if(!commentId){
        throw new ApiError(400,"commentId not available");
    }

    const {newContent} = req.body ;
    if(!newContent){
        throw new ApiError(400,"new content is required");
    }

    const comment = await Comment.findByIdAndUpdate(
        {
            _id:commentId
        },{
        $set:{
            content:newContent
        }
        },{
            new:true
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment updated succesfully"
            )
        )
})

const deleteComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params ;

    if(!commentId){
        throw new ApiError(400,"comment Id not available")
    }

    await Comment.findByIdAndDelete(commentId);

    const existComment = await Comment.findById(commentId);

    if(existComment){
        throw new ApiError(400,"comment not deleted yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "comment deleted successfully"
            )
        );
})

export {addComment , updateComment,deleteComment,getVideoComments};