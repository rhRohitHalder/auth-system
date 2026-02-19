import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config(); //
connectDB();

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded data (e.g., from HTML forms) and make it available in req.body
app.use(cookieParser()); // to parse cookies from incoming requests and make them available in req.cookies  
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
