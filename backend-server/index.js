import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.route.js";
dotenv.config();
connectDB();

const app = express();
const PORT = 3000;


app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
