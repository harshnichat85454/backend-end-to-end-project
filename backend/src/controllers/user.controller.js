import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAndAccessToken = async  (userId) => {
    try{
        const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken , refreshToken};
    }
    catch(error){
        console.log(500,"something went wrong file generating refresh and access token");
    }
}

const registerUser = asyncHandler( async (req,res) => {
    // -take inputs from the req like email , username , fullname , avatar , coverimage , password
    // -check if any of the must  required fields are not empty
    // -1 - username and email should be unique
    // -2 - passqord should be 8 char long and have atleast  1 capital and atleast 1 special character
    // -3 - check if avatar is there 
    // -4 - upload avatar and (cloudinary if present) on cloudinary to generate url
    // 5 - add these entries to database
    // 6 - check if all entries are saved in database
    //console.log(req.body);
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

const loginUser = asyncHandler(async (req,res) => {
    //console.log(req.body);
    const {userName , email , password} = req.body ;
    //console.log(userName);

    if((!userName && !email) || !password){
        throw new ApiError(400,"username/email and password are required");
    }

    const user = await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(400,"user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400,"Password is incorrect");
    }

    const {accessToken , refreshToken} = await generateRefreshAndAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                new ApiResponse(200,
                    {
                        user:loggedInUser,accessToken,refreshToken
                    },
                    "User logged in successfully"
                )
            )

});

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1
        }
    },{
        new:true
    });
    const options = {
        secure:true,
        httpOnly:true
    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(200,"User logged out")
    )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;
    //console.log("incomingRefreshToken",incomingRefreshToken);

    if(!incomingRefreshToken){
        throw new ApiError(400,"unauthorized request")
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decoded?._id);
    
        if(!user){
            throw new ApiError(400,"invalid refresh token")
        }

        // console.log("user",user);
        
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(400,"refresh token is expired or used")
        }
    
        const options = {
            secure:true,
            httpOnly:true
        }
    
        const {accessToken , refreshToken:newRefreshToken} = await generateRefreshAndAccessToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newRefreshToken
                },
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token");
    }
})

const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword , newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"All fields are required");
    }

    const user = await User.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400,"entered old password is incorrect");
    }

    user.password = newPassword ;
    console.log("password",user.password);
    await user.save({validateBeforeSave:false});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Password changed successfully"
            )
        );
})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "current found found"
            ) 
        );
})

const updateAccountDetails = asyncHandler(async (req,res) => {
    const {email , fullName , userName} = req.body ;

    if(!email || !fullName || !userName){
        throw new ApiError(400,"All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                email:email,
                fullName:fullName,
                userName:userName
            }
        }, {
            new:true
        }
    ).select("-password -refreshToken");

    if(!user){
        throw new ApiError(400,"something went wrong while updating user details")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "user details updated successfully"
            )
        );
})

const changeAvatarImage = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path ;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"avatar upload failed on clodinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                avatar:avatar.url
            }
        }, 
        {new:true}).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "avatar image changed"
            )
        );

})

const changeCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"cover Image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"coverImage upload failed on cloudinary");
    }

    const user = await User.findByIdAndUpdate(req.user?._d, {
            $set:{
                coverImage:coverImage.url
            }
    }, {new:true}).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "coverImage changed"
            )
        )
})

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username required");    
    }
    

    const channel = await User.aggregate([
        {
            $match:{
                userName:username?.toLowerCase()
            }
        },{
            $lookup:{
                from: "subscriptions",
                foreignField: "channel",
                localField: "_id",
                as : "subscribers"
            }
        },{
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as : "subscribedTo"
            }
        },{
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if:{$in: [req.user?._id , 
                            {
                                $map: {
                                    input: "$subscribers",
                                    as: "s",
                                    in: "$$s.subscriber"
                                }
                            }]},
                        then:true,
                        else:false
                    }
                }
            }
        },{
            $project:{
                username:1,
                fullName:1,
                email:1,
                avatar:1,
                subscribersCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                coverImage:1
            }
        }])
        console.log("channel",channel);

        if(!channel?.length){
            throw new ApiError(400,"channel does not exist");
        }

        console.log("channel",channel);
        

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    channel,
                    "channel profile found and displayed"
                )
            )
})

const getUserWatchHistory = asyncHandler(async (req,res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHitory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                fullName:1,
                                username:1,
                                avatar:1
                            }
                        }]
                    }
                },{
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }]
            }
        }
    ])
    //console.log("user:",user);
    

    if(!user){
        throw new ApiError(400,"cannot get user details");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "User watch history displayed"
            )
        );
})

export {registerUser , loginUser , logoutUser , refreshAccessToken , changePassword , getCurrentUser,updateAccountDetails,changeAvatarImage,changeCoverImage,getUserChannelProfile,getUserWatchHistory}