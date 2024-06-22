import { io } from "../app.js";
import { emailSocketMap } from "../app.js";
import { Notification } from "../models/notification.model.js";

async function sendMessageToEmail(user, message, token,link) {
    const socketId = emailSocketMap[user.email];
    if (socketId) {

        const notif = await Notification.create({
            user: user._id,
            message,
            token,
            verificationLink: link,
        })

        if(notif){
            io.to(socketId).emit('message', notif);
        }
        else{
            console.log("Unable to create notification")
        }
        
    } else {
        console.log(`No socket found for email: ${user.email}`);
    }
}


export { sendMessageToEmail }