import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";
import { addCheckIn, checkInRequest, checkOut, deleteCheckIn, getAllCheckIns, updateCheckIn } from "../controllers/checkIn.controllers.js";

const router = Router()

router.route("/").get(JWTcheck,SecurityAdmincheck,getAllCheckIns)

//This will only be called if the user is logged in as security admin
router.route("/add").post(JWTcheck,SecurityAdmincheck,upload.single("image"),addCheckIn)

router.route("/addRequest").post(/*JWTcheck,SecurityAdmincheck,*/upload.single("image"),checkInRequest) //Here we are allowing anyone to fill the checkin request form

router.route("/update/:id").post(JWTcheck,SecurityAdmincheck,updateCheckIn)

router.route("/checkOut").post(JWTcheck,SecurityAdmincheck,checkOut)

router.route("/delete/:id").delete(JWTcheck,SecurityAdmincheck,deleteCheckIn)

export default router
