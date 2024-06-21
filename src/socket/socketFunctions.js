import { io } from "../app.js";
import { emailSocketMap } from "./socketHandler.js";

function sendMessageToEmail(email, message) {
    const socketId = emailSocketMap.get(email);
    if (socketId) {
        io.to(socketId).emit('message', message);
    } else {
        console.log(`No socket found for email: ${email}`);
    }
}


export { sendMessageToEmail }