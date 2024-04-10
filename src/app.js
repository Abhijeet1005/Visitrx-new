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
import assetRouter from "./routes/asset.routes.js"
import tokenRouter from "./routes/token.routes.js"
import inwardRouter from "./routes/inward.routes.js"
import assignmentRouter from "./routes/assignment.routes.js"
import errorHandler from "./middlewares/errorHandler.middleware.js";




//Handling route control
app.use("/api/user",userRouter)
app.use("/api/asset",assetRouter)
app.use("/api/token",tokenRouter)
app.use("/api/inward",inwardRouter)
app.use("/api/assignment",assignmentRouter)

app.use(errorHandler)

export {app}