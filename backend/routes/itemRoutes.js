import express from "express";
import Item from "../models/Item.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all sports
router.get("/sports/all", async (req, res) => {
  try {
    const sports = ["cricket", "football", "basketball", "tennis", "badminton", "volleyball", "table_tennis", "athletics"];
    
    // Get count and availability for each sport
    const sportsData = await Promise.all(
      sports.map(async (sport) => {
        const items = await Item.find({ sport });
        const totalItems = items.length;
        const availableCount = items.reduce((sum, item) => sum + item.available, 0);
        
        return {
          name: sport,
          displayName: sport.charAt(0).toUpperCase() + sport.slice(1).replace("_", " "),
          totalItems,
          availableCount,
          icon: getSportIcon(sport)
        };
      })
    );
    
    res.json(sportsData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sports" });
  }
});

// Get items by sport
router.get("/sport/:sport", async (req, res) => {
  try {
    const { sport } = req.params;
    const items = await Item.find({ sport: sport.toLowerCase() });
    // A sport with no items is a normal, empty list - not an error
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Get all items (fallback)
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Add a new item (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, quantity, available, sport, description } = req.body;
    
    if (!sport) {
      return res.status(400).json({ message: "Sport is required" });
    }
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(available) || available < 0 || available > quantity) {
      return res.status(400).json({ message: "quantity and available must be whole numbers with 0 <= available <= quantity" });
    }
    
    const newItem = new Item({ name, quantity, available, sport: sport.toLowerCase(), description });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update item stock (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { available } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!Number.isInteger(available) || available < 0 || available > item.quantity) {
      return res.status(400).json({ message: `available must be a whole number between 0 and ${item.quantity}` });
    }
    item.available = available;
    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete item (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Helper function to get sport icon (emoji)
function getSportIcon(sport) {
  const icons = {
    cricket: "🏏",
    football: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    badminton: "🏸",
    volleyball: "🏐",
    table_tennis: "🏓",
    athletics: "🏃"
  };
  return icons[sport] || "⚽";
}

export default router;