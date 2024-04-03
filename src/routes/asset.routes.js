import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addAsset, deleteAssetById, getAllAssets, updateAssetById } from "../controllers/asset.controllers.js";

const router = Router();

router.route("/").get(JWTcheck,AssetAdmincheck,getAllAssets); // Get all assets

router.route("/add").post(JWTcheck,AssetAdmincheck,upload.fields([
    {
        name: "invoicePhoto",
        maxCount: 1
    },
    {
        name: "productImage",
        maxCount: 1
    }
]),addAsset); // Add new asset

router.route("/delete/:id").post(JWTcheck,AssetAdmincheck,deleteAssetById); // Delete asset

router.route("/update/:id").post(JWTcheck,AssetAdmincheck,updateAssetById); // Update asset




export default router;
