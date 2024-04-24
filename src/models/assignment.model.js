import mongoose, { Schema } from "mongoose";

const assignSchema = new Schema({
    
    assetAssigned: {
        type: Schema.Types.ObjectId,
        ref: "Asset"
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    quantityAssigned: {
        type: Number,
        default: 0
    },

    assignedAt: {
        type: Date,
        default: Date.now
    },

    returnedAt: {
        type: Date
    }

},{timestamps: true})

assignSchema.pre(/^find/, function(next) {
    this.populate({
        path: "assignedTo",
        select: "-password -refreshToken"
    });
    this.populate({
        path: "assetAssigned",
    });
    next();
});

export const Assignment = mongoose.model("Assignment", assignSchema)