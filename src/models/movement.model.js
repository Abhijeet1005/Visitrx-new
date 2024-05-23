import mongoose, { Schema } from "mongoose";

const movementSchema = new Schema({

    checkIn: {
        type: String,
        
    },

    checkOut: {
        type: String,
        default: () => new Date().toISOString()
    },

    employees: {
        type: Array,
        default: []
    },

    workFor: {
        type: String,
        enum: ["Official","Personal"]
    },

    category: {
        type: String,
        enum: ["Officer","Karigar"]
    },

    gatePassNo: {
        type: String,
    },

    purpose: {
        type: String,
    },

    permissionBy: {
        type: String,
    },

    remark: {
        type: String,
    },

    image: {
        type: String,
    }

},{timestamps: true})

export const Movement = mongoose.model("Movement",movementSchema)