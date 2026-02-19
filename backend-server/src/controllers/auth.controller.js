import {User} from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function get_user_register(req, res) {
  const { name, email, password } = req.body;
  try {
    // 1️⃣ Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // password length validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    // 3️⃣ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    // 4️⃣ Check if user already exists
    const existingUser = await User.findOne({email});
    if(existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user_new = await User.create({ name, email, password });

// 5️⃣ If registration is successful, you can generate a token here (e.g., JWT) and send it back to the client
     const token = jwt.sign({ user_id: user_new._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

    res.cookie("_jwt_token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // cookie not accessible via client-side JS - prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax', // Use 'lax' in development for cross-origin requests
      secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
      path: "/" // Ensure the cookie is sent for all paths
    });

    res.status(201).json({ user: user_new, _jwt_token: token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function get_user_login(req, res) {
  const { email, password } = req.body;
  try {
    // 1️⃣ Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // 2️⃣ Check if user exists
    const user = await User.findOne({ email });
    // If user is not found, return an error response
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // If login is successful, you can generate a token here (e.g., JWT) and send it back to the client
     const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

    res.cookie("_jwt_token", token, {
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
      httpOnly: true, // cookie not accessible via client-side JS - prevent XSS attacks
      sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax', // Use 'lax' in development for cross-origin requests
      secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
      path: "/" // Ensure the cookie is sent for all paths
    });

    
    res.status(200).json({ message: "Login successful" , user, _jwt_token: token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function get_user_logout(req,res){
res.clearCookie("_jwt_token", {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/"
});  res.status(200).json({ message: "Logout successful" });
}

async function get_user_profile(req,res) {
  try {
    const user = req.user; // Assuming the user is attached to the request object by the authentication middleware
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export { get_user_register, get_user_login , get_user_logout , get_user_profile };
