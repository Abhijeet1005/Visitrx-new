import { Router } from "express";
import { addEmployee, deleteEmployee, getAllEmployees } from "../controllers/employee.controllers.js";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { AppAdmincheck } from "../middlewares/appAdmin.middleware.js";

const router = Router();

router.route("/add").post(JWTcheck,AppAdmincheck,addEmployee) 
router.route("/").get(JWTcheck,getAllEmployees)
router.route("/delete/:employeeNumber").delete(JWTcheck,AppAdmincheck,deleteEmployee)

export default router