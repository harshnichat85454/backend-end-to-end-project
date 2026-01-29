import mongoose, { mongo } from "mongoose";

const playlistSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    description:{
        type: String,
        trim: true,   
    },
    name:{
        type: String,
        required: true,
    },
    videos:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            index: true,
            unique:true
        }
    ]
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema);