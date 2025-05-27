// Fixed client-side JavaScript
const apiUrl = "https://weather-app-1-zxp7.onrender.com/api/weather?city=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
    if (!city || city.trim() === '') {
        document.querySelector(".error").innerHTML = "<p>Please enter a city name.</p>";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        return;
    }

    try {
        // Show loading state
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".error").style.display = "none";
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = '<p>Loading weather data...</p>';
        loadingDiv.className = 'loading';
        document.querySelector('.card').appendChild(loadingDiv);

        console.log(`Fetching weather for: ${city}`); // Debug log
        
        const response = await fetch(`${apiUrl}${encodeURIComponent(city.trim())}`);
        const data = await response.json();
        
        // Remove loading indicator
        const loading = document.querySelector('.loading');
        if (loading) loading.remove();

        console.log('API Response:', data); // Debug log

        // Check for various error conditions
        if (!response.ok || data.cod === "404" || data.cod === 404 || data.error) {
            let errorMessage = "City not found. Please check the spelling.";
            
            if (data.message) {
                errorMessage = data.message;
            } else if (data.error) {
                errorMessage = data.error;
            }
            
            document.querySelector(".error").innerHTML = `<p>${errorMessage}</p>`;
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        // Validate required data fields
        if (!data.name || !data.main || !data.weather || !data.weather[0]) {
            document.querySelector(".error").innerHTML = "<p>Invalid weather data received.</p>";
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        // Update weather display
        document.querySelector(".city").innerHTML = data.name + (data.sys?.country ? ", " + data.sys.country : "");
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = Math.round((data.wind?.speed || 0) * 3.6) + " km/h";

        const weatherCondition = data.weather[0].main.toLowerCase();
        const iconMap = {
            'clouds': 'images/clouds.png',
            'clear': 'images/clear.png',
            'rain': 'images/rain.png',
            'drizzle': 'images/drizzle.png',
            'mist': 'images/mist.png',
            'snow': 'images/snow.png',
            'thunderstorm': 'images/thunderstorm.png',
            'fog': 'images/mist.png',
            'haze': 'images/mist.png'
        };
        
        weatherIcon.src = iconMap[weatherCondition] || 'images/clear.png';

        const description = data.weather[0].description;
        document.querySelector(".city").innerHTML += `<br><small style="font-size: 16px; opacity: 0.8;">${description.charAt(0).toUpperCase() + description.slice(1)}</small>`;

        if (data.main.feels_like) {
            const feelsLike = Math.round(data.main.feels_like);
            document.querySelector(".temp").innerHTML += `<br><small style="font-size: 16px; opacity: 0.8;">Feels like ${feelsLike}°C</small>`;
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

    } catch (error) {
        // Remove loading indicator
        const loading = document.querySelector('.loading');
        if (loading) loading.remove();
        
        console.error('Error fetching weather data:', error);
        
        let errorMessage = "Network error. Please check your connection.";
        if (error.message.includes('Failed to fetch')) {
            errorMessage = "Unable to connect to weather service. Please check if the server is running.";
        }
        
        document.querySelector(".error").innerHTML = `<p>${errorMessage}</p>`;
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
}

// Enhanced search functionality
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city) {
        checkWeather(city);
    } else {
        document.querySelector(".error").innerHTML = "<p>Please enter a city name.</p>";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
});

// Add Enter key support
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value.trim();
        if (city) {
            checkWeather(city);
        } else {
            document.querySelector(".error").innerHTML = "<p>Please enter a city name.</p>";
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
        }
    }
});

// Mode Toggle - Remove localStorage usage for artifacts
const modeToggle = document.getElementById("modeToggle");

// Default to dark mode
let currentTheme = "dark";
modeToggle.innerText = "☀️ Light Mode";

modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    
    const isLight = document.body.classList.contains("light-mode");
    modeToggle.innerText = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    currentTheme = isLight ? "light" : "dark";
});

// Enhanced Speech Recognition
const micBtn = document.getElementById("micBtn");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener("click", () => {
        if (!micBtn.classList.contains("listening")) {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        micBtn.classList.add("listening");
        micBtn.title = "Listening...";
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        searchBox.value = spokenText;
        checkWeather(spokenText);
    };

    recognition.onend = () => {
        micBtn.classList.remove("listening");
        micBtn.title = "Voice Search";
    };

    recognition.onerror = (event) => {
        micBtn.classList.remove("listening");
        const errorMessages = {
            'network': 'Network error occurred.',
            'not-allowed': 'Microphone access denied.',
            'no-speech': 'No speech detected. Please try again.',
            'aborted': 'Speech recognition aborted.'
        };
        
        const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
        alert(message);
    };

    micBtn.title = "Voice Search";
} else {
    micBtn.style.display = "none";
    console.warn("Speech recognition is not supported in this browser.");
}

// Load weather for user's location on page load
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    console.log(`Getting location weather for: ${lat}, ${lon}`);
                    const response = await fetch(`https://weather-app-1-zxp7.onrender.com/api/weather/location?lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    console.log('Location API Response:', data);
                    
                    if (response.ok && data.name) {
                        searchBox.value = data.name;
                        checkWeather(data.name);
                    } else {
                        console.log('Location weather failed, using default');
                        checkWeather('London');
                    }
                } catch (error) {
                    console.error('Error getting location weather:', error);
                    checkWeather('London');
                }
            },
            (error) => {
                console.log('Geolocation error:', error.message);
                checkWeather('London');
            }
        );
    } else {
        console.log('Geolocation not supported, using default');
        checkWeather('London');
    }
});
