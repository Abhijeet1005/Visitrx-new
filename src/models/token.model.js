import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true //This will help quickly find the tokens
    }
})

export const Token = mongoose.model("Token",tokenSchema)


/*
This collection will be used to store used tokens so that we can prevent the use of token multiple times
*/