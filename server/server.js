// server/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
app.get("/api/weather/location", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
