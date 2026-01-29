import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlists.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req,res) => {
    const {name,description} = req.body ;

    if(!name || !description){
        throw new ApiError(400,"all fields are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    });

    if(!playlist){
        throw new ApiError(400,"playlist not made yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist made successfully"
            )
        );
})

const getPlaylistById = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is wrong");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Playlist does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist found successfully"
            )
        );
})

const getUserPlaylists = asyncHandler(async (req,res) => {
    const userId = req.user._id;

    if(! mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId not available");
    }

    const {page=1 , limit=10} = req.query ;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.min(parseInt(limit, 10), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },{
            $project:{
                name:1,
                description:1,
                createdAt:1,
                updatedAt: 1,
                totalVideos: { $size: "$videos"}
            }
        },
        {$sort : { createdAt : -1}},
        {$skip: skip},
        {$limit: limitNumber}
    ]);

    const totalPlaylists = await Playlist.countDocuments({owner:userId});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    playlists,
                    pagination:{
                        total:totalPlaylists,
                        page:pageNumber,
                        limit:limitNumber,
                        totalPages:Math.ceil(totalPlaylists / limitNumber)
                    }
                }
            )
        );
})

const deletePlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is not available");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if(playlist){
        throw new ApiError(400,"playlist not deleted yet");
    }

    return res
        .status(400)
        .json(
            new ApiResponse(
                200,
                "playlist deleted successfully"
            )
        );
})

const addVideoToPlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is not available");
    }

    const {videoId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"videoId is not available");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:videoId
        }},{
            new: true
        }
    );

    if(!playlist){
        throw new ApiError(400,"video not added yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "video added to this playlist"
            )
        );
})

const removeVideoFromPlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is not available");
    }

    const {videoId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"videoId is not available");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        }},{
            new: true
        }
    );

    if(!playlist){
        throw new ApiError(400,"video not removed yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "video removed to this playlist"
            )
        );
})

const updatePlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params ;

    if(! mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId not available");
    }

    const {title , description} = req.body ;

    const updates = {};

    if(title) updates.title = title ;
    if(description) updates.description = description ;

    if(updates.length == 0){
        throw new ApiError(400,"Atleast one is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $set : updates
    },{
        new : true
    });

    if(!playlist){
        throw new ApiError(400,"playlist not updated yet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist updated sucessfully"
            )
        );
})

export {createPlaylist ,
    getPlaylistById,
    getUserPlaylists,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist};