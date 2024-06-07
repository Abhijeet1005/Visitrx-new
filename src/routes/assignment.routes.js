import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { assetAssignRequest, assetUnAssignRequest, getAllAssignments, getAllForDepartment, getAllForUser, getAssignmentById } from "../controllers/assignment.controllers.js";
import { AssetAdmincheck } from "../middlewares/assetAdmin.middleware.js";
import { adminDepartment } from "../middlewares/adminDepartment.middleware.js";
import { AppAndAssetAdmincheck } from "../middlewares/assetAndAppAdminCheck.middleware.js";

const router = Router();

router.route("/assign/:id").post(JWTcheck,AssetAdmincheck,assetAssignRequest) //Makes a new asset assignment request, :id is of asset to be assigned

router.route("/unassign/:id").post(JWTcheck,assetUnAssignRequest) //This is taking the assignment ID

router.route("/getAll").get(JWTcheck,AppAndAssetAdmincheck,getAllAssignments)

router.route("/getAssignment/:id").get(getAssignmentById)

router.route("/getAllForUser/:email").get(JWTcheck,getAllForUser) //We will be using email directly because they are unique

router.route("/getAllForDepartment").get(JWTcheck,adminDepartment,getAllForDepartment) //This wil automatically fetch the department from logged in user and send the employee assignments

export default router