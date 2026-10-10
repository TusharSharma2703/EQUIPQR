import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, required: true },
    },
  ],
  status: { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
  qrCode: { type: String }, // will store QR code data (base64)
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;