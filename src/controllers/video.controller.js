import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video }  from "../models/videos.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


// getVideos , publishAVideo ,getVideoById , updateVideo , deleteVideo , togglePublishStatus

const getVideos = asyncHandler(async (req,res) => {

});

const publishAVideo = asyncHandler(async (req,res) => {
    const {title , description} = req.body ;

    if(!title || !description){
        throw new ApiError(400,"All fields are required");
    }

    const videoLocalPath = req.files?.videofile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,"video and thumbnail file is required");
    }

    const videoUrl = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoUrl || !thumbnailUrl){
        throw new ApiError(500,"something went wrong while uploading video and thumbnail on cloudinary");
    }


    const video = await Video.create({
        file:videoUrl.url,
        thumbnail:thumbnailUrl.url,
        title,
        description,
        owner:req.user._id,
        isPublished:true,
    })

    const options = {
        secure:true,
        httpOnly:true
    }

    const existVideo = await Video.findById(video?._id, options);

    if(!existVideo){
        throw new ApiError(400,"Video publish failed");
    }
    
    console.log("video",existVideo);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video published successfully"
            )
        )
});

const getVideoById = asyncHandler(async (req,res) => {
    const { videoId } = req.params ;

    if(!videoId){
        throw new ApiError(400,"Video Id is required");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Video not found / Video Id is wrong ")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video found successfully"
            )
        )
});


const updateVideo = asyncHandler(async (req,res) => {
    const { videoId } = req.params ;

    if(!videoId){
        throw new ApiError(400,"Video Id not found");
    }

    const { title , description} = req.body ;

    const updateFields = {};

    if(title) updateFields.title = title ;
    if(description) updateFields.description = description ;

    const thumbnailLocalPath = req.file?.path;
    console.log(thumbnailLocalPath)

    if(thumbnailLocalPath){
        const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

        if(!thumbnailUrl){
            throw new ApiError(400,"thumbnail cloudinary upload failed")
        }else {
            updateFields.thumbnail = thumbnailUrl.url ;
        }
    }
    console.log("update fields : ",updateFields);

    if(Object.keys(updateFields).length ==0) {
        throw new ApiError(400,"Aleast one field is required");
    }


    const video = await Video.findByIdAndUpdate(
        {
            _id:videoId,
            owner:req.user._id
        }, 
        {
            $set: updateFields
        }, 
        {
            new:true,
            runValidators:true
        }
    );
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "All details updated"
            )
        );
});


const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params ;
    
    await Video.findByIdAndDelete(videoId);

    const video = await Video.findById(videoId);

    if(video){
        throw new ApiError(400,"video not deleted yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video deleted successfully"
            )
        )
});


const togglePublishStatus = asyncHandler(async (req,res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        { _id:videoId , owner:req.user._id },
        [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ],
        {
            new : true,
            updatePipeline:true
        }
    );


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "toggled isPublished"
            )
        )
});

export {getVideos , publishAVideo ,getVideoById , updateVideo , deleteVideo , togglePublishStatus};