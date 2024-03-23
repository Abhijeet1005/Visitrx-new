import mongoose, { Schema } from "mongoose";

const assetSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },

    type: {
        type: String,
        enum: ["Returnable","Non-Returnable"],
        required: true
    },

    details: {
        type: String,
        trim: true
    },

    assetImage: {
        type: String,
        default: "https://picsum.photos/id/619/200/200"
    },

    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },

    quantityInStock: {
        type: Number,
        default: 0
    },

    quantityTotal: {
        type: Number,
        default: 0
    },

    unit: {
        type: String,
        default: "units"
    },

    // assignments: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: "Assignment"
    // }]


},{timestamps: true})


export const Asset = mongoose.model("Asset",assetSchema)

 