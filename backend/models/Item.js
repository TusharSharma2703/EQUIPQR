import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  available: { type: Number, required: true },
  sport: { 
    type: String, 
    required: true,
    enum: ["cricket", "football", "basketball", "tennis", "badminton", "volleyball", "table_tennis", "athletics"]
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model("Item", itemSchema);
export default Item;