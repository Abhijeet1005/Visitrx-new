import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({

    //meetingWithContact
    //meetingWithName
    //expectedTimeofMeet
    //personInCharge
    //meetingFinished - this will be a timestamp

    meetingWithContact: {
        type: String,
        required: true
    },

    meetingWithName: {
        type: String,
    },

    expectedTimeOfMeet: {
        type: String,
    },

    personInCharge: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    meetingFinished: {
        types: String,
    }

},{timestamps: true})

export const Meeting = mongoose.model("Meeting",meetingSchema)