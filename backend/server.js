const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});