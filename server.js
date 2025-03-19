const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch stock data
app.get("/api/stock", async (req, res) => {
  try {
    const { data, error } = await supabase.from("stock").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock data", error });
  }
});

// Update stock movement
app.post("/api/stock/update", async (req, res) => {
  try {
    const { id, stockIn, stockOut } = req.body;
    const { data: stockItem, error } = await supabase.from("stock").select("*").eq("id", id).single();
    
    if (error || !stockItem) return res.status(400).json({ message: "Item not found" });
    
    const newCarryForward = stockItem.broughtForward + stockIn - stockOut;
    
    await supabase.from("stock").update({
      stockIn,
      stockOut,
      carryForward: newCarryForward,
    }).eq("id", id);

    res.json({ message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
