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

app.listen(process.env.PORT, () => {
  console.log("Server running on port 5000");
});

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});