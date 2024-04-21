import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new  Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["Employee","AssetAdmin","SecurityAdmin","AppAdmin","AccountsAdmin","AccountsEmployee"], // We can add more xxAdmin and xxEmployee values
        default: "Employee"
    },

    avatar: {
        type: String,
        default: "https://picsum.photos/id/555/300/300"
    },

    password: {
        type: String,
        required: [true, "Password Required"] //Message for false condition
    },
    
    refreshToken: {
        type: String
    }

},{timestamps: true})

userSchema.pre('save',async function(next){     

    if(!this.isModified("password")) return next();  //Here we are using normal function because we want the pre to have the context ('this') of the user schema
    this.password = await bcrypt.hash(this.password, 10) //Do not remove the "await" here even if the editor suggests
    next()
})


//These methods below are available with per 'user' and not in the whole User model, make sure to keep this in mind when accessing these
//This method check for the password entered         
userSchema.methods.isPasswordCorrect = async function(password){
    const response = await bcrypt.compare(password, this.password)

    return  response
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            role: this.role,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)