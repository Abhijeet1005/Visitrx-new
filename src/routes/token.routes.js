import { Router } from "express";
import { tokenCheckMiddleware } from "../controllers/token.controllers.js";
import { assetAssign, assetUnAssign } from "../controllers/assignment.controllers.js";
import { addAssetFromInward } from "../controllers/asset.controllers.js";


const router = Router()

router.route("/assetAssign/:token").get(tokenCheckMiddleware,assetAssign); 
router.route("/assetUnAssign/:token").get(tokenCheckMiddleware,assetUnAssign); 
router.route("/assetsFromSecurityCheck/:token").get(tokenCheckMiddleware,addAssetFromInward)

export default router