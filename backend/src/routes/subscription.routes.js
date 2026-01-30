import {Router} from "express" ;
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubcribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router() ;

router.use(verifyJWT);

router.route("/:channelId").post(toggleSubscription).get(getUserChannelSubcribers);
router.route("/").get(getSubscribedChannels);

export default router ;