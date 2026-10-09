import { Router } from "express";
import { toggleSubscription } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// secured route
router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription)

export default router