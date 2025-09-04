const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); 

const app = express();


app.use(cors());
app.use(express.json());

// Routes
const audioRoutes = require("./routes/audio");
app.use("/api/audio", audioRoutes);

// Health check
app.get("/ping", (req, res) => {
  res.json({ message: "Backend is alive 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");

