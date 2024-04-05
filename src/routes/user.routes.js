import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AppAdmincheck } from "../middlewares/appAdmin.middleware.js";
import { changeCurrentPassword, getUser, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/check").get((req,res)=>{res.status(200).send("OK")})
router.route("/").get(JWTcheck,getUser)
// router.route("/getAllUsers").get(JWTcheck,/*getAllUsers*/) //Add the AppAdmin check middleware here
router.route("/register").post(JWTcheck,AppAdmincheck,registerUser) //After registering the AppAdmin user, add the AppAdmin middleware here
router.route("/login").post(loginUser)
router.route("/logout").post(JWTcheck,logoutUser)
router.route("/changePassword").post(JWTcheck,changeCurrentPassword)

export default router