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
    },

    gatePassNo: {
        type: String
    },

    authorisedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps: true})

outwardSchema.pre(/^find/, function(next) {
    this.populate({
        path: "assetId",
    });
    next();
});

export const Outward = mongoose.model("Outward",outwardSchema)