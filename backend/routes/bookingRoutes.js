import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Item from "../models/Item.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";
import QRCode from "qrcode";
import { reserveStock, releaseStock, expirePendingBooking } from "../utils/stock.js";

const router = express.Router();

const PENDING_TIMEOUT_MS = 2 * 60 * 1000;

// Allowed status changes: target status -> statuses it may come from
const ALLOWED_FROM = {
  approved: ["pending"],
  rejected: ["pending"],
  returned: ["approved"],
};

// Stops one user from firing two "Book" requests at the same instant
const bookingInProgress = new Set();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new booking
router.post("/", protect, async (req, res) => {
  const { items } = req.body;
  const userId = req.user._id.toString();

  // ✅ Step 1: Validate the request (never trust the client)
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Select at least one item to book" });
  }
  if (items.some((i) => !isValidId(i?.item))) {
    return res.status(400).json({ message: "Invalid item in booking" });
  }
  if (items.some((i) => i.quantity !== 1)) {
    return res.status(400).json({ message: "You can book only one unit of each item" });
  }
  const itemIds = items.map((i) => String(i.item));
  if (new Set(itemIds).size !== itemIds.length) {
    return res.status(400).json({ message: "Each item can appear only once in a booking" });
  }

  if (bookingInProgress.has(userId)) {
    return res.status(429).json({ message: "Your previous booking request is still being processed" });
  }
  bookingInProgress.add(userId);

  try {
    // ✅ Step 2: One active booking per user
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existingBooking) {
      return res.status(400).json({
        message:
          "You already have a pending/approved booking. Please return the items or wait for autocancellation before creating a new one.",
      });
    }

    // ✅ Step 3: All items must exist and belong to ONE sport
    const dbItems = await Item.find({ _id: { $in: itemIds } });
    if (dbItems.length !== itemIds.length) {
      return res.status(404).json({ message: "One or more items no longer exist" });
    }
    if (new Set(dbItems.map((i) => i.sport)).size > 1) {
      return res.status(400).json({ message: "You can only book items from one sport at a time" });
    }

    // ✅ Step 4: Reserve stock atomically (all-or-nothing)
    const lines = itemIds.map((item) => ({ item, quantity: 1 }));
    const reservation = await reserveStock(lines);
    if (!reservation.ok) {
      const name = dbItems.find((i) => i._id.toString() === String(reservation.failedItem))?.name;
      return res.status(400).json({ message: `${name || "Item"} is out of stock` });
    }

    // ✅ Step 5: Create booking + QR (release the stock again if anything fails)
    let booking;
    try {
      booking = await Booking.create({ user: req.user._id, items: lines, status: "pending" });
      booking.qrCode = await QRCode.toDataURL(JSON.stringify({ bookingId: booking._id }));
      await booking.save();
    } catch (err) {
      if (booking) await Booking.deleteOne({ _id: booking._id });
      await releaseStock(lines);
      throw err;
    }

    // ✅ Step 6: Auto-expire after 2 minutes if still pending (cron job is the backup)
    setTimeout(() => {
      expirePendingBooking(booking._id)
        .then((expired) => expired && console.log(`⏰ Auto-deleted pending booking ${booking._id}`))
        .catch((err) => console.error("Auto-delete error:", err));
    }, PENDING_TIMEOUT_MS);

    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ message: "Server error while creating booking" });
  } finally {
    bookingInProgress.delete(userId);
  }
});

// Get the logged-in student's own bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.item");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Admin approves / rejects / marks returned
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_FROM[status]) {
    return res.status(400).json({ message: "Status must be approved, rejected or returned" });
  }
  if (!isValidId(req.params.id)) return res.status(404).json({ message: "Booking not found" });

  try {
    // Atomic transition: only succeeds if the booking is currently in an allowed state.
    // A double-click or two admins acting at once can therefore apply it only once.
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ALLOWED_FROM[status] } },
      { $set: { status } },
      { new: true }
    );

    if (!booking) {
      const current = await Booking.findById(req.params.id);
      if (!current) return res.status(404).json({ message: "Booking not found (it may have expired)" });
      return res
        .status(409)
        .json({ message: `Booking is already ${current.status}; cannot change it to ${status}` });
    }

    // Rejected or returned items go back into stock (exactly once, thanks to the atomic update above)
    if (status === "rejected" || status === "returned") {
      await releaseStock(booking.items);
    }

    await booking.populate([{ path: "user", select: "name email" }, { path: "items.item" }]);
    res.json(booking);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Error updating booking" });
  }
});

// Get all bookings (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.item");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// Get single booking by ID (admin, or the student who owns it)
router.get("/:id", protect, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ message: "Booking not found" });

  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.item");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const isOwner = booking.user?._id.toString() === req.user._id.toString();
    if (!req.user.isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not allowed to view this booking" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking" });
  }
});

export default router;
