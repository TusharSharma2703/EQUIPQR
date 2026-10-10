import mongoose from "mongoose";

const bookingSlotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: String, required: true }, // e.g. "10:00 AM"
  endTime: { type: String, required: true },   // e.g. "11:00 AM"
  date: { type: String, required: true },      // e.g. "2025-11-05"
  createdAt: { type: Date, default: Date.now }
});

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true },        // e.g. "Badminton Court 1"
  type: { 
    type: String, 
    required: true,
    enum: ["badminton", "tennis", "cricket", "football", "volleyball"]
  },
  bookings: [bookingSlotSchema],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  // If two people book the same turf at the same moment, the second save fails
  // with a VersionError instead of silently creating a double booking
  optimisticConcurrency: true
});

const Turf = mongoose.model("Turf", turfSchema);
export default Turf;