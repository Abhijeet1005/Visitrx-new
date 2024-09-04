import dotenv from 'dotenv';
import { connectDB, connectRedis } from "./db/db.js";
import {app,server} from './app.js';


dotenv.config({
    path: './.env'
})
connectRedis()
.then(()=>{
    return connectDB()
})
.then((host)=>{
    console.log(`MongoDB connected with host: ${host} 🎉 `)

    server.listen(process.env.PORT, () => {
        console.log(`App listening on port ${process.env.PORT} 👂`);
    });

    app.on('error',(err)=>{
        console.log(`App initialization error ${err}`)
    })
})
.catch((err)=>{
    console.log(`Error occured : ${err}`)
})