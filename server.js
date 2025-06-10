/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Sets up an Express server serving static files from the "public" directory
 * and provides an API endpoint "/api/data" to serve the JSON demo data.
 */
app.use(express.static("public"));

app.get("/api/data", (req, res) => {
  try{
    const data = fs.readFileSync(path.join(__dirname, "data/data.json"), "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (error) {
    console.error("Failed to load JSON:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});