import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io"

const app = express()

const server = http.createServer(app)
console.log("Http server initialized...")

const io = new Server(server,{
    cors: {
        origin: process.env.CORS_ORIGIN,
    }
})

const emailSocketMap = new Map();

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id} with email ${socket.email}`);

    socket.on('register', (email)=>{
        emailSocketMap.set(email, socket.id);
    })

    //Socket disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        emailSocketMap.delete(email);
    });

});

console.log("Socket server initialized...")

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}
))

app.use(express.json({limit: '16kb'})) //Limit the json data size and using this instead of using body parser 
app.use(express.urlencoded({limit: '16kb',extended: true})) // For the URL params
app.use(express.static('public')) // Configuring the static file serve folder
app.use(cookieParser())   // To handle the cookies created on the user's end


//Importing User router
import userRouter from "./routes/user.routes.js"
import assetRouter from "./routes/asset.routes.js"
import tokenRouter from "./routes/token.routes.js"
import inwardRouter from "./routes/inward.routes.js"
import outwardRouter from "./routes/outward.routes.js"
import checkInRouter from "./routes/checkIn.routes.js"
import movementRouter from "./routes/movement.routes.js"
import assignmentRouter from "./routes/assignment.routes.js"
import employeeRouter from "./routes/employee.routes.js"
import meetingRouter from "./routes/meeting.routes.js"
import errorHandler from "./middlewares/errorHandler.middleware.js";





//Handling route control
app.use("/api/user",userRouter)
app.use("/api/employee",employeeRouter)
app.use("/api/asset",assetRouter)
app.use("/api/token",tokenRouter)
app.use("/api/inward",inwardRouter)
app.use("/api/outward",outwardRouter)
app.use("/api/assignment",assignmentRouter)
app.use("/api/checkIn",checkInRouter)
app.use("/api/movement",movementRouter)
app.use("/api/meeting",meetingRouter)


app.use(errorHandler)

export {app, server, io, emailSocketMap}