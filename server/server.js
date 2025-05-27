// server/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// Add this middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Weather App Backend is Running!");
});

// Main weather API endpoint - THIS WAS MISSING!
app.get("/api/weather", async (req, res) => {
    const { city } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
    }
    
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }
    
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Weather API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            res.status(404).json({ 
                cod: "404",
                message: "City not found. Please check the spelling." 
            });
        } else {
            res.status(500).json({ 
                error: "Failed to fetch weather data.",
                message: "Unable to connect to weather service"
            });
        }
    }
});

// Location-based weather endpoint
app.get("/api/weather/location", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }
    
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }
    
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Location Weather API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to fetch weather data for location.",
            message: "Unable to connect to weather service"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
