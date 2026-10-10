import cron from "node-cron";
import Booking from "../models/Booking.js";
import { expirePendingBooking } from "../utils/stock.js";

// Runs every minute. Safety net for the 2-minute setTimeout in BookingRoutes,
// which is lost if the server restarts.
cron.schedule("* * * * *", async () => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const expired = await Booking.find(
      { status: "pending", createdAt: { $lt: twoMinutesAgo } },
      { _id: 1 }
    );

    for (const booking of expired) {
      if (await expirePendingBooking(booking._id)) {
        console.log(`⏰ Auto-deleted expired booking ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("Auto-cleanup error:", err);
  }
});
