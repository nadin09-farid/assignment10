import mongoose from "mongoose";
import { type } from "node:os";
import { GenderEnum, Provider, RoleEnum } from "../../Common/Enums/user.enum.js";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            // lw el user 3amel login b google msh h7tag a store el password 3ndi fel database 34an aslun
            //fel data elli rag3aly msh bikoon feha password
            // ama baa lw 3amel login mn el system 3ndi hna baa el password haikoon required 

            // required -> takes a boolean OR a function that checks baa
            required: function () {
                return this.provider == Provider.System;
            },
        },
        phone: String,
        DOB: Date,
        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            default: GenderEnum.Male,
        },
        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.User,
        },
        confirmEmail: {
            type: Boolean,
            default: false,
        },
        provider: {
            type: String,
            enum: Object.values(Provider),
            default: Provider.System,
        },
        // bnstore fel database el url bta3 el pic msh el sora nfsaha
        profile_pic: String,
        otp: {
            type: String
        },

        otpExpires: {
            type: Date
        },

        isVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    },
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;