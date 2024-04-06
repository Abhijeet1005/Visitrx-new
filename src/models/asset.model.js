import mongoose, { Schema } from "mongoose";

const assetSchema = new Schema({

    productName: {
        type: String,
        required: true,
        trim: true,
    },

    returnType: {
        type: String,
        enum: ["Returnable","Non-Returnable"],
        required: true
    },

    type: {
        type: String,
        enum: ["Software","Hardware","Other"],
        default: "Other"
    },

    details: {
        type: String,
        trim: true
    },

    invoiceImage: {
        type: String,
        default: "https://picsum.photos/id/619/200/200"
    },

    productImage: {
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

    returnDate: {
        type: Date,
    },

    condition: {
        type: String,
        enum: ["Old","New","Scrap"],
        default: "New"
    },

    tags: {
        type: String,
    },

    buyingDate: {
        type: Date
    },

    expiryDate: {
        type: Date
    }

    // assignments: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: "Assignment"
    // }]


},{timestamps: true})


export const Asset = mongoose.model("Asset",assetSchema)

 