import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

// Usage: npm run make-admin -- someone@thapar.edu
// (Register the account in the app first, then run this.)
const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@thapar.edu");
  process.exit(1);
}

await connectDB();
const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
console.log(user ? `✅ ${user.email} is now an admin (log out and back in)` : `❌ No user with email ${email} - register first`);
await mongoose.disconnect();
