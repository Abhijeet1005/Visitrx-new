import mongoose from "mongoose";
import { Redis } from "ioredis";

const connectDB = async () => {
  try {
    let connectionString;

    if (process.env.NODE_ENV === "test") {
      connectionString = `${process.env.TESTING_MONGO}`;
      console.log("-- Connecting to testing database --");
    } else {
      connectionString = `${process.env.MONGO}/${process.env.DB_NAME}`;
      console.log("-- Connecting to main database --");
    }

    const connectionData = await mongoose.connect(connectionString);
    // console.log(`MongoDB connected with host: ${connectionData.connection.host}`)
    return connectionData.connection.host;
  } catch (error) {
    // console.log('MongoDB connection error', error)
    throw error;
    process.exit(1);
  }
};

let redis;
const connectRedis = async () => {
 try {

   redis = new Redis(process.env.REDIS)
   console.log("-- Connected to redis --")

 } catch (error) {
  
  throw error
 }
}
export {
  connectDB,
  connectRedis,
  redis
}
