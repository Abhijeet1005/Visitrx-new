import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(JWTcheck,AssetAdmincheck,/*getAllAssets*/); // Get all assets

router.route("/addAsset").post(JWTcheck,AssetAdmincheck,upload.single("assetImage"),/*addAsset*/); // Add new asset

export default router;
