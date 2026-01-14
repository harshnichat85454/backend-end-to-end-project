import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema({
    video_id: {
        type:String,
        required:true,
        unique:true,
    },
    video_file: {
        type:String,
        required:true,
    },
    video_thumbnail: {
        type:String,
        required:true,
    },
    video_owner: {
        type:Schema.Types.ObjectId,
        ref: "User",
        required:true,
        unique:true,
    },
    video_title: {
        type:String,
        required:true,
    },
    video_description: {
        type:String,
    },
    video_duration: {
        type:Number,
        required:true,
    },
    video_views: {
        type:Number,
        default:0,
        required:true,
    },
    video_isPublished: {
        type:Boolean,
        default:true,
        required:true,
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const  Video = mongoose.model("Video" ,videoSchema);