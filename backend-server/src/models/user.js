import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"]
    },
    newPassword:{
      type: String,
       minlength: [6, "Password must be at least 6 characters"],
       default: null
    },
    verifyOtp: {
      type: String,
      default: null
    },

    verifyOtpExpireAt: {
      type: Number,
      default: 0
    },

    resetOtp: {
      type: String,
      default: null
    },

    resetOtpExpireAt: {
      type: Number,
      default: 0
    },

    isAccountVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.pre("save",async function() { if(!this.isModified("password")) { return; }
 this.password = await bcrypt.hash(this.password, 10); }); 
export const User = mongoose.model("User", userSchema)