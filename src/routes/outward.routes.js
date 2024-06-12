import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { allAdminCheck } from "../middlewares/allAdmin.middleware.js";
import { deleteOutward, getAllOutwards, outwardCreationRequest, outwardReturnRequest, updateOutward } from "../controllers/outward.controller.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";

const router = Router()

router.route("/").get(JWTcheck,allAdminCheck,getAllOutwards)
router.route("/addRequest").post(JWTcheck,AssetAdmincheck,outwardCreationRequest) //Here we are expecting an asset ID
router.route("/returnRequest").post(JWTcheck,SecurityAdmincheck,outwardReturnRequest) //Here we are expecting outward ID
router.route("/update/:id").post(JWTcheck,SecurityAdmincheck,updateOutward)
router.route("/delete/:id").delete(JWTcheck,SecurityAdmincheck,deleteOutward)

export default router