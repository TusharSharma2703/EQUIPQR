import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import protect from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register user
router.post("/register", async (req, res) => {
  const { name, password } = req.body;
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const email = String(req.body.email || "").trim().toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        isAdmin : user.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user profile
router.get("/profile", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
});

export default router;
