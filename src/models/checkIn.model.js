import mongoose, { Schema } from "mongoose";

const checkInSchemna = new Schema({

    checkIn: {
        type: Date,
        default: Date.now
    },

    checkOut: {
        type: Date,
    },

    guest: {
        type: String,
        enum: ["Visitor","Vendor","Guest","Karigar"]
    },

    personName: {
        type: String
        //Required
    },

    comingFrom: {
        type: String
    },

    contactNo: {
        type: String,
        //Required
    },

    meetingWith: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    floor: {
        type: Number
    },

    department: {
        type: String,
        //We can fetch this from the user's profile 
    },

    purpose: {
        type: String,
        //Required
    },

    remark: {
        type: String
    },

    image: {
        type: String
    }

},{timestamps: true})

checkInSchemna.pre(/^find/, function(next) {
    this.populate({
        path: "meetingWith",
        select: "-password -refreshToken"
    });
    next();
});

export const CheckIn = mongoose.model("CheckIn",checkInSchemna)