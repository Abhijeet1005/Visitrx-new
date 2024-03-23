import { Router } from "express";
import { tokenCheckMiddleware } from "../controllers/token.controllers.js";
import { assetAssign, assetUnAssign } from "../controllers/assignment.controllers.js";


const router = Router()

router.route("/assetAssign/:token").get(tokenCheckMiddleware,assetAssign); 
router.route("/assetUnAssign/:token").get(tokenCheckMiddleware,assetUnAssign); 

export default router