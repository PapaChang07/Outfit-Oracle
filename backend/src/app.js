const express = require("express");
const cors = require("cors");
const outfitRoutes = require("./routes/outfitRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/outfits", outfitRoutes);

module.exports = app;