import mongoose, { Schema } from "mongoose";

const assetSchema = new Schema({

    productName: {
        type: String,
        required: true,
        trim: true,
    },

    modelNo: {
        type: String,
    },

    returnType: {
        type: String,
        enum: ["Returnable","Non-Returnable"],
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

},{timestamps: true})


assetSchema.pre(/^find/, function(next) {
    this.populate({
        path: "createdBy",
        select: "-password -refreshToken"
    });
    next();
});

export const Asset = mongoose.model("Asset",assetSchema)

 