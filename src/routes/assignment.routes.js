import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { assetAssignRequest, assetUnAssignRequest, getAllForUser } from "../controllers/assignment.controllers.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";

const router = Router();

router.route("/assign/:id").post(JWTcheck,AssetAdmincheck,assetAssignRequest) //Makes a new asset assignment request, :id is of asset to be assigned

router.route("/unassign/:id").post(JWTcheck,assetUnAssignRequest) //This is taking the assignment ID

router.route("/getAllForUser/:email").get(JWTcheck,getAllForUser) //We will be using email directly because they are unique

export default router