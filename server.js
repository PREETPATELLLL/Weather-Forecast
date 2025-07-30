require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;
const API_KEY = "25854bf2095a5b06dc33e2603dc8e4ad";

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database("./weather.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite database.");
});

// Create table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS forecast (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    date TEXT,
    temp REAL,
    humidity INTEGER

  )`
);


// Create cities table
db.run(
  `CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`
);

// Fetch weather data
app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;
  
  if (!city) {
      return res.status(400).json({ error: "City name is required" });
  }

  try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
      const forecasts = response.data.list.filter((item, index) => index % 8 === 0);

      // Delete old city data first
      db.run("DELETE FROM forecast WHERE city = ?", [city], (err) => {
          if (err) console.error("Delete Error:", err.message);
      });

      // Insert new data into the database
      const insertStmt = db.prepare("INSERT INTO forecast (city, date, temp,humidity) VALUES (?, ?, ?, ?)");

      forecasts.forEach((item) => {
          insertStmt.run(city, item.dt_txt, item.main.temp, (err) => {
              if (err) console.error("Insert Error:", err.message);
          });
      });

      insertStmt.finalize();

      res.json({ message: "Weather data saved successfully", forecasts });
  } catch (error) {
      console.error("API Fetch Error:", error.message);
      res.status(500).json({ error: "Failed to fetch data" });
  }
});


// Save searched city to the database
app.post("/api/populateData", (req, res) => {
  const { city } = req.body;

  if (!city) {
      return res.status(400).json({ error: "No city provided" });
  }

  // Insert the city into the database (ignore if already exists)
  db.run("INSERT OR IGNORE INTO cities (name) VALUES (?)", [city], (err) => {
      if (err) {
          console.error("Database Insert Error:", err.message);
          return res.status(500).json({ error: "Failed to save city" });
      }
      console.log(`City '${city}' saved successfully!`);
      res.json({ message: `City '${city}' saved successfully!` });
  });
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




// http://localhost:5000/weather/delhi this is get fetch the data
