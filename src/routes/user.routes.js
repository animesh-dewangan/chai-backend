import { Router } from "express";
import { logoutUser, loginUser, registerUser, refreshAccessToken,changeUserPassword,
    getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory
 } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([{name: 'avatar', maxCount: 1}, {name: 'coverImage', maxCount: 1}]),
    registerUser)

router.route("/login").post(loginUser)

// Secured route -> user must be logged in to perform this tasks
router.route("/logout").post(verifyJWT, logoutUser) // after .post <middleWare>, <anotherMiddleWare> if requrired then <requestedService>
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeUserPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)

// updateAccountDetails must be done on patch otherwise all the feilds will be updated
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(
            verifyJWT,
            upload.single("avatar"),
            updateUserAvatar
        )

/* /c/:username -> it is used beacuse the data is not comming from body it's comming from url 
   and username is used because the function asked for username while destructuring*/
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


export default router