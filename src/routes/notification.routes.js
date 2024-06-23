import { Router } from "express";
import { JWTcheck } from "../middlewares/auth.middleware.js";
import { getNotificationsForUser, makeItRead } from "../controllers/notification.controllers.js";

const router = Router();

router.route("/getNotifications").get(JWTcheck,getNotificationsForUser)

router.route("/isRead").post(JWTcheck,makeItRead)

/*
Notifs will be created internally when required by directly using the controller provided and
isRead will also be modified internally on successful token verification  
*/