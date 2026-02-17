import User from "./src/models/user.js";

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
    if(existingUser.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function get_user_login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export { get_user_register, get_user_login };
