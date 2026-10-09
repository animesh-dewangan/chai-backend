import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { optionalAuthorization } from "../middlewares/optionalJWT.middleware.js"
import { getAllVideos, publishAVideo, getVideoById,
        updateVideo, deleteVideo, togglePublishStatus
        } from "../controllers/video.controller.js"

const router = Router()

// can be used by user who are not logged in
router.route("/").get(getAllVideos)

// secured routes -> user must be logged in to perfrom this task
router.route("/uploadvideo").post(verifyJWT,
                            upload.fields([
                                {name: "video", maxCount: 1},
                                {name: "thumbnail", maxCount: 1}
                            ]),publishAVideo)

// input is sent via -> params
router.route("/getvideoby/:videoId").get(optionalAuthorization, getVideoById)
router.route("/updatevideo/:videoId").patch(verifyJWT,
                            upload.single("thumbnail"),
                            updateVideo)
router.route("/deletevideo/:videoId").delete(verifyJWT,deleteVideo)
router.route("/togglevideopublish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router