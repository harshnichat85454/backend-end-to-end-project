import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // -take inputs from the req like email , username , fullname , avatar , coverimage , password
    // -check if any of the must  required fields are not empty
    // -1 - username and email should be unique
    // -2 - passqord should be 8 char long and have atleast  1 capital and atleast 1 special character
    // -3 - check if avatar is there 
    // -4 - upload avatar and (cloudinary if present) on cloudinary to generate url
    // 5 - add these entries to database
    // 6 - check if all entries are saved in database

    const {userName , email , password , fullName} = req.body;

    if(!userName || !email || !password || !fullName){
        throw new ApiError(400,"All fields are necessary");
    }

    const existUser = await User.findOne({
        $or:[{userName},{email}]
    })

    if(existUser){
        throw new ApiError(400,"User already exist with this username/email");
    }

    const regrex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    
    if(!regrex.test(password)){
        throw new ApiError(400,"password should be 8 char long and have atleast  1 capital and atleast 1 special character ");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageUrl="";
    if(req.files && req.files.coverImage && req.files.coverImage.length >0){
        const coverImageLocalPath = req.files.coverImage[0].path ;
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        coverImageUrl = coverImage?.url || "";
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500,"cloudinary failed to upload avatar");
    }

    const user = await User.create({
        userName,
        email,
        password,
        fullName,
        avatar:avatar.url,
        coverImage:coverImageUrl
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"something went wrong while creating user");
    }

    return res.status(200).json(
        new ApiResponse(200,createdUser,"user created successfully")
    )
});

export {registerUser}