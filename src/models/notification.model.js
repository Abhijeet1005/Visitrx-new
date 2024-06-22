import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    
    message: {
        type: String,
        default: "Notification"
    },

    token: {
        type: String,
        index: true
    },

    isRead: {
        type: Boolean,
        default: false
    },

    verificationLink: {
        type: String,
        required: true
    }

},{timestamps: true})

export const Notification = mongoose.model("Notification",notificationSchema)