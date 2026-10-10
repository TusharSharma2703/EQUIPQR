import express from "express";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Generate one-time admin access QR
router.post("/admin", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Create a short-lived token (5 mins)
    const payload = { id: req.user._id, isAdmin: true, quickAccess: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5m" });

    const url = `https://equip-qr-vnwx.vercel.app/?oneTimeAdmin=${encodeURIComponent(token)}`;

    // Generate base64 QR code image
    const qr = await QRCode.toDataURL(url);

    res.json({
      success: true,
      message: "One-time admin QR generated successfully!",
      url,
      qrCode: qr,
      expiresIn: "5 minutes",
    });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: "Failed to generate QR" });
  }
});

export default router;
