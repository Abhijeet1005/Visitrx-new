import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addAsset, deleteAssetById, getAllAssets } from "../controllers/asset.controllers.js";

const router = Router();

router.route("/").get(JWTcheck,AssetAdmincheck,getAllAssets); // Get all assets

router.route("/add").post(JWTcheck,AssetAdmincheck,upload.single("invoicePhoto"),addAsset); // Add new asset

router.route("/delete/:id").post(JWTcheck,AssetAdmincheck,deleteAssetById); // Delete asset




export default router;
