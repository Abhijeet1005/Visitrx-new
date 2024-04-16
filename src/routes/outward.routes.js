import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { allAdminCheck } from "../middlewares/allAdmin.middleware.js";
import { getAllOutwards, outwardCreationRequest } from "../controllers/outward.controller.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";

const router = Router()

router.route("/").get(JWTcheck,allAdminCheck,getAllOutwards)
router.route("/addRequest/:id").post(JWTcheck,AssetAdmincheck,outwardCreationRequest) //Here we are expecting an asset ID

export default router