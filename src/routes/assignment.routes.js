import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware";
import { assetAssignRequest, assetUnAssignRequest } from "../controllers/assignment.controllers.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";

const router = Router();

router.route("/assign/:id").post(JWTcheck,AssetAdmincheck,assetAssignRequest) //Makes a new asset assignment request, :id is of asset to be assigned

router.route("/unassign/:id").post(JWTcheck,assetUnAssignRequest) //This is taking the assignment ID

export default router