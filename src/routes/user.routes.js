import { Router} from "express" ;
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
console.log({
    registerUser,
    type: typeof registerUser
});


router.post("/register",registerUser);

export default router ;