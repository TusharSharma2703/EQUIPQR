import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import turfRoutes from "./routes/turfRoutes.js";
import quickAccessRoutes from "./routes/quickAccessRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working fine ✅");
});

app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/turfs", turfRoutes);
app.use("/api/quick-access", quickAccessRoutes);

// Catch-all error handler so unexpected errors return JSON instead of crashing the request
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Server error" });
});

const PORT = process.env.PORT || 5000;

// Start accepting requests only after the database is connected
await connectDB();
await import("./jobs/autoCleanup.js");
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
