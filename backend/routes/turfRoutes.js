import express from "express";
import Turf from "../models/Turf.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Convert "10:00 AM", "02:30 PM" or "14:30" into minutes since midnight.
// Comparing raw strings is wrong: "02:00 PM" < "10:00 AM" alphabetically.
function toMinutes(time) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(String(time || ""));
  if (!match) return NaN;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Two time ranges on the same date overlap if each starts before the other ends
function hasConflict(bookings, date, startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return bookings.some(
    (b) => b.date === date && start < toMinutes(b.endTime) && end > toMinutes(b.startTime)
  );
}

function validateSlot({ date, startTime, endTime }) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "A valid date is required";
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return "Valid start and end times are required";
  if (end <= start) return "End time must be after start time";
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return "Cannot book a slot in the past";
  return null;
}

// ✅ Get all turfs
router.get("/", async (req, res) => {
  try {
    const turfs = await Turf.find().sort({ type: 1, name: 1 });
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turfs" });
  }
});

// ✅ Get turfs by type
router.get("/type/:type", async (req, res) => {
  try {
    const turfs = await Turf.find({ type: req.params.type.toLowerCase() }).sort({ name: 1 });
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turfs" });
  }
});

// ✅ Get single turf with bookings
router.get("/:id", async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id).populate("bookings.user", "name email");
    if (!turf) return res.status(404).json({ message: "Turf not found" });
    res.json(turf);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turf" });
  }
});

// ✅ Check availability for a specific turf
router.post("/:id/availability", protect, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const invalid = validateSlot(req.body);
  if (invalid) return res.status(400).json({ message: invalid });

  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    const conflict = hasConflict(turf.bookings, date, startTime, endTime);

    if (conflict) {
      return res.json({ available: false, message: "Slot not available" });
    } else {
      return res.json({ available: true, message: "Slot available" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error checking availability" });
  }
});

// ✅ Book a slot
router.post("/:id/book", protect, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const invalid = validateSlot(req.body);
  if (invalid) return res.status(400).json({ message: invalid });

  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    const conflict = hasConflict(turf.bookings, date, startTime, endTime);

    if (conflict) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Add booking
    turf.bookings.push({
      user: req.user._id,
      date,
      startTime,
      endTime,
    });

    await turf.save();
    
    // Populate user info before sending response
    await turf.populate("bookings.user", "name email");
    
    res.json({ message: "Booking successful ✅", turf });
  } catch (err) {
    if (err.name === "VersionError") {
      return res.status(409).json({ message: "Someone just booked this turf - please check the slot again" });
    }
    res.status(500).json({ message: "Error creating booking" });
  }
});

// ✅ Get user's bookings
router.get("/user/bookings", protect, async (req, res) => {
  try {
    const turfs = await Turf.find({ "bookings.user": req.user._id })
      .populate("bookings.user", "name email");
    
    // Extract only user's bookings
    const userBookings = [];
    turfs.forEach(turf => {
      turf.bookings.forEach(booking => {
        if (booking.user._id.toString() === req.user._id.toString()) {
          userBookings.push({
            _id: booking._id,
            turfId: turf._id,
            turfName: turf.name,
            turfType: turf.type,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            createdAt: booking.createdAt
          });
        }
      });
    });
    
    res.json(userBookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// ✅ Cancel booking
router.delete("/:id/cancel", protect, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    // Remove the booking
    const initialLength = turf.bookings.length;
    turf.bookings = turf.bookings.filter(
      b =>
        !(
          b.user.toString() === req.user._id.toString() &&
          b.date === date &&
          b.startTime === startTime &&
          b.endTime === endTime
        )
    );

    if (turf.bookings.length === initialLength) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await turf.save();
    res.json({ message: "Booking cancelled ✅", turf });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking" });
  }
});

export default router;