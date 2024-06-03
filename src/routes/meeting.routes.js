import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";
import { addMeeting, deleteMeeting, getAllMeetings, getAllMeetingsForHead, updateMeeting } from "../controllers/meeting.controllers.js";

const router = Router()

router.route("/").get(JWTcheck,SecurityAdmincheck,getAllMeetings) // Only for security and app admin

router.route("/allMeetingsForHead").get(JWTcheck,getAllMeetingsForHead)

router.route("/add").post(JWTcheck,addMeeting)
router.route("/update/:id").post(JWTcheck,updateMeeting)
router.route("/delete/:id").delete(JWTcheck,deleteMeeting)


export default router