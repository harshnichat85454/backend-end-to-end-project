import mongoose ,{Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    user_id: {
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    user_watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref: 'Video',
        }
    ],
    user_name: {
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true,
        index:true,
    },
    user_email: {
        type:String,
        required:true,
        unique:true,
        lowerCase:true,
        trim:true,
    },
    user_fullName: {
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    user_avatar: {
        type:String, // cloudinary url
        required:true,
    },
    user_coverImage: {
        type:String,
    },
    user_password: {
        type:String,
         required:[true,"password is required"],
    },
    user_refreshToken: {
        type:String,
        required:true,
    },
},{timestamps:true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("user_password")) return next();
    this.user_password = bcrypt.hash(this.user_password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (user_password) {
    return await bcrypt.compare(user_password, this.user_password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            user_id: this.user_id,
            user_email: this.user_email,
            user_name: this.user_name,
            user_fullName: this.user_fullName
        }, process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generatRefreshToken = function () {
    return jwt.sign(
        {
            user_id: this.user_id,
        }, process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User",userSchema);