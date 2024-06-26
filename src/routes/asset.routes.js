import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addAsset, deleteAssetById, getAllAssets, getAssetById, updateAssetById } from "../controllers/asset.controllers.js";
import { allAdminCheck } from "../middlewares/allAdmin.middleware.js";

const router = Router();

router.route("/").get(JWTcheck,allAdminCheck,getAllAssets); // Get all assets

router.route("/add").post(JWTcheck,AssetAdmincheck,upload.fields([
    {
        name: "invoiceImage",
        maxCount: 1
    },
    {
        name: "productImage",
        maxCount: 1
    }
]),addAsset); // Add new asset

router.route("/delete/:id").delete(JWTcheck,AssetAdmincheck,deleteAssetById); // Delete asset

router.route("/update/:id").post(JWTcheck,AssetAdmincheck,updateAssetById); // Update asset

router.route("/getAsset/:id").get(/*JWTcheck,AssetAdmincheck,*/getAssetById); 




export default router;
