import mongoose, { Schema } from "mongoose";

/*
How will outward work ?
=> Each outward entry will have a reference to an asset entry and will contain the additional details outward quantity, time etc.
*/

const outwardSchema = new Schema({
    
    assetId: {
        type: Schema.Types.ObjectId,
        ref: "Asset",
        required: true
    },

    returnType: {
        type: String,
        enum: ["Returnable","Non-Returnable"],
        required: true
    },

    returnDate: {
        type: Date
    },

    quantity: {
        type: Number,
        required: true
    },

    sendingToContact: {
        type: String,
        required: true
    },

    sendingToName: {
        type: String
    },

    details: {
        type: String,
    }

},{timestamps: true})

export const Outward = mongoose.model("Outward",outwardSchema)