import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";
import { addCheckIn, getAllCheckIns } from "../controllers/checkIn.controllers.js";

const router = Router()

router.route("/").get(JWTcheck,SecurityAdmincheck,getAllCheckIns)

//This will only be called if the user is logged in as security admin
router.route("/add").post(JWTcheck,SecurityAdmincheck,upload.single("Image"),addCheckIn)
