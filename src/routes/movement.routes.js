import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";
import { addMovement, checkIn, deleteMovement, getAllMovements, updateMovement } from "../controllers/movement.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(JWTcheck,SecurityAdmincheck,getAllMovements)

router.route("/add").post(JWTcheck,SecurityAdmincheck,upload.single("image"),addMovement)

router.route("/checkIn").post(JWTcheck,SecurityAdmincheck,checkIn)

router.route("/delete/:id").delete(JWTcheck,SecurityAdmincheck,deleteMovement)

router.route("/update/:id").post(JWTcheck,SecurityAdmincheck,updateMovement)

export default router