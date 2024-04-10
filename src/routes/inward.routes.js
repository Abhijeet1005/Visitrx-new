import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { SecurityAdmincheck } from "../middlewares/securityAdmin.middleware.js";
import { addInward, getAllInward } from "../controllers/inward.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/").get(JWTcheck,SecurityAdmincheck,getAllInward)
router.route("/add").post(JWTcheck,SecurityAdmincheck,upload.fields([
    {
        name: "invoicePhoto",
        maxCount: 1
    },
    {
        name: "productImage",
        maxCount: 1
    }
]),addInward)

export default router


