import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    employeeNumber: {
        type: String,
    },
    name: {
        type: String,
    },
    location: {
        type: String,
    },
    department: {
        type: String,
    },
    jobTitle: {
        type: String,
    },
}, { timestamps: true });

export const Employee = mongoose.model("Employee", employeeSchema);
