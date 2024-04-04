import mongoose, { Schema } from "mongoose";

const inwardSchema = new Schema({

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

    quantityTotal: {
        type: Number,
        default: 0
    },

    unit: {
        type: String,
        default: "units"
    },

    assetReference: {
        type: mongoose.Types.ObjectId,
        ref: "Asset",
        default: null
    },

    broughtByContact: {
        type: String,
        required: true
    },
    
    broughtByName: {
        type: String,
    },

    // verified: {
    //     type: Boolean,
    //     default: false
    // }

},{timestamps: true})

export const Inward = mongoose.model("Inward",inwardSchema)