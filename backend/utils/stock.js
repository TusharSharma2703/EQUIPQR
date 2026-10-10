import Item from "../models/Item.js";
import Booking from "../models/Booking.js";

// Atomically reserve stock for every line in `lines` ([{ item, quantity }]).
// The availability check and the decrement happen in ONE database operation,
// so two students can never both take the last unit.
// If any line fails, everything already reserved is released (all-or-nothing).
export async function reserveStock(lines) {
  const reserved = [];
  for (const line of lines) {
    const updated = await Item.findOneAndUpdate(
      { _id: line.item, available: { $gte: line.quantity } },
      { $inc: { available: -line.quantity } },
      { new: true }
    );
    if (!updated) {
      await releaseStock(reserved);
      return { ok: false, failedItem: line.item };
    }
    reserved.push(line);
  }
  return { ok: true };
}

// Put stock back, never letting `available` go above the total `quantity`.
export async function releaseStock(lines) {
  for (const line of lines) {
    const itemId = line.item?._id ?? line.item;
    await Item.updateOne({ _id: itemId }, [
      { $set: { available: { $min: ["$quantity", { $add: ["$available", line.quantity] }] } } },
    ]);
  }
}

// Delete a booking ONLY if it is still pending, and release its stock.
// findOneAndDelete is atomic, so if the 2-minute timer and the cron job (or an
// admin approval) race each other, only one of them can win.
export async function expirePendingBooking(bookingId) {
  const expired = await Booking.findOneAndDelete({ _id: bookingId, status: "pending" });
  if (!expired) return false;
  await releaseStock(expired.items);
  return true;
}
