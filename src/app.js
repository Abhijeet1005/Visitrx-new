import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';

const app = express()

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

//Handling route control
app.use("/api/user",userRouter)


export {app}