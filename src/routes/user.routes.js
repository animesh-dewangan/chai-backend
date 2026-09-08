import { Router } from "express";
import { logoutUser, loginUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([{name: 'avatar', maxCount: 1}, {name: 'coverImage', maxCount: 1}]),
    registerUser)

router.route("/login").post(loginUser)

// Secured route -> user must be logged in to perform this tasks
router.route("/logout").post(verifyJWT, logoutUser) // after .post <middleWare>, <anotherMiddleWare> if requrired then <requestService>
router.route("/refresh-token").post(refreshAccessToken)

export default router