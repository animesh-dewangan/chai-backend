import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllVideos, publishAVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/videos").get(getAllVideos)

// secured routes -> user must be logged in to perfrom this task
router.route("/uploadvideo").post(verifyJWT,upload.single("video"),publishAVideo)

export default router