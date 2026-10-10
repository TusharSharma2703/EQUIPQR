import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Item from "../models/Item.js";

dotenv.config();

// Adds sample equipment for every sport. Existing items are left untouched,
// so it is safe to run more than once.
const items = [
  { name: "Cricket Bat", quantity: 5, sport: "cricket" },
  { name: "Cricket Ball", quantity: 10, sport: "cricket" },
  { name: "Football", quantity: 6, sport: "football" },
  { name: "Basketball", quantity: 6, sport: "basketball" },
  { name: "Tennis Racket", quantity: 4, sport: "tennis" },
  { name: "Badminton Racket", quantity: 8, sport: "badminton" },
  { name: "Shuttlecock Box", quantity: 5, sport: "badminton" },
  { name: "Volleyball", quantity: 4, sport: "volleyball" },
  { name: "Table Tennis Paddle", quantity: 6, sport: "table_tennis" },
  { name: "Relay Baton", quantity: 8, sport: "athletics" },
];

await connectDB();
let added = 0;
for (const it of items) {
  const exists = await Item.findOne({ name: it.name, sport: it.sport });
  if (!exists) {
    await Item.create({ ...it, available: it.quantity });
    added++;
  }
}
console.log(`✅ Added ${added} item(s); ${items.length - added} already existed`);
await mongoose.disconnect();
