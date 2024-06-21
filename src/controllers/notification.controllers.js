import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

//Get notif for email
//Create notif (db write and send message call)

const getNotificationsForUser = asyncHandler(async (req,res)=>{

    const days = 10 //Later can take this as a query parameter

    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const notifs = await Notification.find({
        user: req.user?._id,
        createdAt: { $gte: daysAgo }
    })

    if(notifs === undefined){
        throw new ApiError(500, "Unable to fetch notifications")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Notifications fetched successfully",
            notifs
        )
    )
}) 

const createNotification = asyncHandler(async (req,res)=>{

})

export { getNotificationsForUser, createNotification }