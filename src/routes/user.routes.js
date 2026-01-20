import { Router} from "express" ;
import { registerUser ,
        loginUser ,
        logoutUser ,
        refreshAccessToken,
        changePassword,
        getCurrentUser,
        updateAccountDetails} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


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

router.route("/login").post(upload.none(),loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(upload.none(),verifyJWT,changePassword);
router.route("/get-current-user").get(verifyJWT,getCurrentUser);
router.route("/change-account-details").patch(upload.none(),verifyJWT,updateAccountDetails)


export default router ;