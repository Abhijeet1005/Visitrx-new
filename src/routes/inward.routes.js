import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware";
import { getAllInward } from "../controllers/inward.controllers";


const router = Router()

router.route("/").get(JWTcheck,/*SecurityAdmincheck,*/getAllInward)

