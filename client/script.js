const apiUrl = "http://localhost:5000/api/weather?city=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
    try {
        // Show loading state
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".error").style.display = "none";

        const response = await fetch(`${apiUrl}${city}`);
        const data = await response.json();

        // Check for various error conditions
        if (!response.ok || data.cod === "404" || data.cod === 404 || data.message) {
            let errorMessage = "City not found. Please check the spelling.";
            
            // Customize error message based on response
            if (data.message) {
                errorMessage = data.message;
            }
            
            document.querySelector(".error").innerHTML = `<p>${errorMessage}</p>`;
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        // Rest of your existing code for successful response...
        document.querySelector(".city").innerHTML = data.name + ", " + data.sys.country;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = Math.round(data.wind.speed * 3.6) + " km/h";

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

        const feelsLike = Math.round(data.main.feels_like);
        document.querySelector(".temp").innerHTML += `<br><small style="font-size: 16px; opacity: 0.8;">Feels like ${feelsLike}°C</small>`;

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";

    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector(".error").innerHTML = "<p>Network error. Please check your connection.</p>";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
}

// Enhanced search functionality
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city) {
        checkWeather(city);
    }
});

// Add Enter key support
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchBox.value.trim();
        if (city) {
            checkWeather(city);
        }
    }
});

// Mode Toggle with improved functionality
const modeToggle = document.getElementById("modeToggle");

// Load saved theme or default to dark
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    modeToggle.innerText = "🌙 Dark Mode";
} else {
    modeToggle.innerText = "☀️ Light Mode";
}

modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    
    const isLight = document.body.classList.contains("light-mode");
    modeToggle.innerText = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    localStorage.setItem("theme", isLight ? "light" : "dark");
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

    // Add tooltip
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
                    // Use your backend server instead of direct API call
                    const response = await fetch(`http://localhost:5000/api/weather/location?lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                        searchBox.value = data.name;
                        checkWeather(data.name);
                    }
                } catch (error) {
                    console.error('Error getting location weather:', error);
                    // Default to a popular city
                    checkWeather('London');
                }
            },
            (error) => {
                console.log('Geolocation error:', error.message);
                // Default to a popular city
                checkWeather('London');
            }
        );
    } else {
        // Default to a popular city if geolocation is not supported
        checkWeather('London');
    }
});