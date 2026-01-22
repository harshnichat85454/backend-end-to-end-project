import { Router} from "express" ;
import { registerUser ,
        loginUser ,
        logoutUser ,
        refreshAccessToken,
        changePassword,
        getCurrentUser,
        updateAccountDetails,
        changeAvatarImage,
        changeCoverImage,
        getUserChannelProfile,
        getUserWatchHistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//register
router.route("/register")
    .post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
    ]),registerUser);

//login logout user
router.route("/login").post(upload.none(),loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

//change current details
router.route("/change-password").post(upload.none(),verifyJWT,changePassword);
router.route("/get-current-user").get(verifyJWT,getCurrentUser);
router.route("/change-account-details").patch(upload.none(),verifyJWT,updateAccountDetails);

//change avatar and cover images
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),changeAvatarImage);
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),changeCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getUserWatchHistory);


export default router ;