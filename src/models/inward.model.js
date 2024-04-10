import mongoose, { Schema } from "mongoose";

const inwardSchema = new Schema({

    assets: {
        type: Array,
        required: true,
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
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    //These fields will be fetched from products array later on

    // quantityTotal: {
    //     type: Number,
    //     default: 0
    // },

    // unit: {
    //     type: String,
    //     default: "units"
    // },

    assetReference: [
        {
            type: Schema.Types.ObjectId,
            ref: "Asset"
        }
    ],

    assetType: {
        type: String,
        enum: ["Asset","Stock","Other"],
        default: "Other"
    },

    broughtByContact: {
        type: String,
        required: true
    },
    
    companyName: {
        type: String,
    },

    invoiceNo: {
        type: String
    },

    invoiceAmount: {
        type: Number
    },

    //for returnable products
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

    //This is warranty expiry
    expiryDate: {
        type: Date
    }


},{timestamps: true})

export const Inward = mongoose.model("Inward",inwardSchema)