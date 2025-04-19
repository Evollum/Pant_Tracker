const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pantTracker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define a schema and model for pant entries
const pantSchema = new mongoose.Schema({
  date: String,
  quantity: Number,
  typeLabel: String,
  total: Number,
  isDonated: Boolean,
  isLottery: Boolean,
  lotteryAmount: Number,
});

const PantEntry = mongoose.model("PantEntry", pantSchema);

// Routes
app.get("/entries", async (req, res) => {
  const entries = await PantEntry.find();
  res.json(entries);
});

app.post("/entries", async (req, res) => {
  const newEntry = new PantEntry(req.body);
  await newEntry.save();
  res.json(newEntry);
});

app.delete("/entries/:id", async (req, res) => {
  await PantEntry.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

// Fetch entries and update UI
let entries = [];

async function fetchEntries() {
  const response = await fetch("http://localhost:5000/entries");
  entries = await response.json();
  updateUI();
}

async function saveEntry(entry) {
  await fetch("http://localhost:5000/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });
}

async function deleteEntry(id) {
  await fetch(`http://localhost:5000/entries/${id}`, {
    method: "DELETE",
  });
}

fetchEntries();

// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
