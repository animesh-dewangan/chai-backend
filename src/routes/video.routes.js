import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllVideos, publishAVideo, getVideoById,
        updateVideo
} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { optionalAuthorization } from "../middlewares/optionalJWT.middleware.js"

const router = Router()

// can be used by user who are not logged in
router.route("/videos").get(getAllVideos)

// secured routes -> user must be logged in to perfrom this task
router.route("/uploadvideo").post(verifyJWT,
                            upload.fields([
                                {name: "video", maxCount: 1},
                                {name: "thumbnail", maxCount: 1}
                            ]),publishAVideo)
router.route("getvideoby/:videoId").get(optionalAuthorization, getVideoById)
router.route("updatevideo/:videoId").patch(verifyJWT,
                            upload.single("thumbnail"),
                            updateVideo)

export default router