import {User} from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from '../config/nodemailer.js';
import dotenv from "dotenv";
dotenv.config();

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


    // sending welcome email to the user after successful registration
    const mailOptions = {
      from : process.env.EMAIL_USER,
      to : user_new.email,
      subject : "Welcome to our website",
      text : `Hi ${user_new.name},\n\nThank you for registering on our website! We're excited to have you as part of our community. If you have any questions or need assistance, feel free to reach out to us.\n\nBest regards,\nThe Team`
    }
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending welcome email:", error);
      } else {
        console.log("Welcome email sent:", info.response);
      }
    });



    res.status(201).json({ 
      message: "Registration successful",
      user: user_new });
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

async function send_Verification_otp(req, res) {
  try {
    const userID = req.user._id;
    const _user = await User.findById(userID);
    if(_user.isAccountVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }
      
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    // Store the OTP in the database or cache with an expiration time (e.g., 5 minutes)
    // For example, you can create a separate collection for OTPs or add a field to the user model  
    _user.verifyOtp = otp;   // Store the OTP in the user document (you should also add an expiration time)
    _user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // Set OTP expiration time to 5 minutes from now

    await _user.save();      
    const mailOptions = {
      from:process.env.EMAIL_USER,
      to: _user.email,
      subject: "Account Verification OTP",
      text: `Your OTP for account verification is: ${otp}. It will expire in 5 minutes.`
    }
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
} 
async function verify_email(req,res) {
  const { otp } = req.body;
  const userID = req.user; // Assuming the user is attached to the request object by the authentication middleware
  if(!otp || !userID) {
    return res.status(400).json({ message: "OTP and user ID are required" });
  } 
  try {
    const _user = await User.findById(userID);
    if(_user.isAccountVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }
    if (_user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (_user.verifyOtp !== otp || _user.verifyOtp === null) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    _user.isAccountVerified = true;
    _user.verifyOtp = null;
    _user.verifyOtpExpireAt = 0;
    
    await _user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } 
}
async function is_authenticated(req,res) {
  const token = req.cookies._jwt_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  } 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    } 
    res.status(200).json({ user }); 
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
// send reset otp
async function send_reset_otp(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() +15 * 60 * 1000; // Set OTP expiration time to 5 minutes from now
    await user.save();      
    const mailOptions = {
      from:process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password OTP",
      text: `Your OTP for reset password is: ${otp}. It will expire in 5 minutes.`
    }
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
} 
// reset password function can also be implemented similarly by accepting email, otp and new password in the request body, 
//verifying the otp and then updating the password after hashing it.
async function reset_password(req,res) {
  const { email, otp, newPassword } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If no OTP provided, send OTP
    if (!otp && !newPassword) {
      const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetOtp = otpValue;
      user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
      await user.save();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Password OTP",
        text: `Your OTP for reset password is: ${otpValue}. It will expire in 15 minutes.`
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: "OTP sent to email" });
    }

    // If OTP and newPassword provided, verify and reset
    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (user.resetOtp !== otp || user.resetOtp === null) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOtp = null;
    user.resetOtpExpireAt = 0;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}
export { get_user_register, get_user_login , get_user_logout , get_user_profile , send_Verification_otp , verify_email, is_authenticated, send_reset_otp, reset_password};
