import { Router } from "express";
import { tokenCheckMiddleware } from "../middlewares/tokenCheck.middleware.js";
import { assetAssign, assetUnAssign } from "../controllers/assignment.controllers.js";
import { addAssetFromInward } from "../controllers/asset.controllers.js";
import { createOutward, outwardReturn } from "../controllers/outward.controller.js";


const router = Router()

router.route("/assetAssign/:token").get(tokenCheckMiddleware,assetAssign); 
router.route("/assetUnAssign/:token").get(tokenCheckMiddleware,assetUnAssign); 
router.route("/assetsFromSecurityCheck/:token").get(tokenCheckMiddleware,addAssetFromInward)
router.route("/outwardRequestFromAssetAdmin/:token").get(tokenCheckMiddleware,createOutward)
router.route("/outwardReturn/:token").get(tokenCheckMiddleware,outwardReturn)

export default router