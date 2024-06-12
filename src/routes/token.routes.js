import { Router } from "express";
import { tokenCheckMiddleware } from "../middlewares/tokenCheck.middleware.js";
import { assetAssign, assetUnAssign } from "../controllers/assignment.controllers.js";
import { addAssetFromInward } from "../controllers/asset.controllers.js";
import { createOutward, outwardReturn } from "../controllers/outward.controller.js";
import { addCheckInFromToken } from "../controllers/checkIn.controllers.js";


const router = Router()

router.route("/assetAssign/:token").get(tokenCheckMiddleware,assetAssign); 
router.route("/assetUnAssign/:token").get(tokenCheckMiddleware,assetUnAssign); 
router.route("/assetsFromSecurityCheck/:token").get(tokenCheckMiddleware,addAssetFromInward)
router.route("/outwardRequestFromAssetAdmin").get(tokenCheckMiddleware,createOutward)
router.route("/outwardReturn").get(tokenCheckMiddleware,outwardReturn)
router.route("/checkInVerify").get(tokenCheckMiddleware,addCheckInFromToken)

export default router