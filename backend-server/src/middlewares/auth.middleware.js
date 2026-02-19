import jwt from "jsonwebtoken";
import {User} from '../models/user.js';
import dotenv from "dotenv";
dotenv.config();

const protected_routes = async (req, res, next) => {
    const token = req.cookies._jwt_token;
    //console.log(req.cookies);
   // console.log(token);
    
    
    if (!token) {
        console.log("No token found in cookies -- PROTECT ROUTES MIDDLEWARE");
      return res.status(401).json({ message: "Unauthorized" });
    }
  try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id_).select("-password");
    if (!user) {
      return res.status(401).json({ message: "protectRoutes : Unauthorized - user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export {protected_routes};

