import { Router } from "express";
import { addEmployee } from "../controllers/employee.controllers.js";
import { JWTcheck } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(JWTcheck ,addEmployee) //Later add admin auth here

export default router