import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    }
},{timestamps:true});

likeSchema.index({ likedBy: 1, video: 1 });
likeSchema.index({ createdAt: -1 });


export const Like = mongoose.model("Like",likeSchema);