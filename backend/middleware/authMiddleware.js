import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    // Token is valid but the account no longer exists
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Use after protect: only admins may continue
export const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ message: "Admin access only" });
};

export default protect;
