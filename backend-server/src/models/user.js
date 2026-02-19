import mongoose from "mongoose";
import bcrypt from "bcrypt";

 const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters"], // with custom error message
    }
 }, {
    timestamps: true,
 })

// pre save hook to hash the password before saving the user document
// This ensures that the password is always stored in a hashed format in the database, enhancing security.

/*
With pre("save") middleware

Password hashing happens:
✔ Automatically
✔ Every time password changes
✔ In one central place
✔ Impossible to forget 
*/

 userSchema.pre("save",async function() {
    if(!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
 });


 export const User = mongoose.model("User", userSchema)