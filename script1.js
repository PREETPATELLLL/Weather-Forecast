const apiKey = '25854bf2095a5b06dc33e2603dc8e4ad'; // Replace with your OpenWeatherMap API Key
const map = L.map("map").setView([20, 0], 2);
const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const weatherLayer = L.layerGroup().addTo(map);
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const saveLocationBtn = document.getElementById("saveLocationBtn");
const savedLocationsList = document.getElementById("savedLocationsList");

let currentLocation = null;

// Fetch weather and update UI
const fetchWeather = async (city) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        updateWeatherUI(data);
        updateMap(data.coord.lat, data.coord.lon);
    } catch (error) {
        alert(error.message);
    }
};

// Update UI with weather data
const updateWeatherUI = (data) => {
    document.getElementById("locationName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("dateInfo").textContent = new Date().toDateString();
    document.getElementById("currentTemp").innerHTML = `${data.main.temp}&deg;C`;
    document.getElementById("feelsLikeTemp").innerHTML = `${data.main.feels_like}&deg;C`;
    document.getElementById("weatherDescription").textContent = data.weather[0].description;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    currentLocation = { name: data.name, lat: data.coord.lat, lon: data.coord.lon };
};

// Update Map
const updateMap = (lat, lon) => {
    map.setView([lat, lon], 10);
    weatherLayer.clearLayers();
    L.marker([lat, lon]).addTo(weatherLayer);

    // Add OpenWeatherMap overlays
    const rainLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`);
    const tempLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`);
    const windLayer = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`);

    const overlays = { "🌧 Rain": rainLayer, "🌡 Temperature": tempLayer, "💨 Wind": windLayer };
    L.control.layers({}, overlays).addTo(map);
};

// Get current location
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
                );
                if (!response.ok) throw new Error("Unable to fetch location data");
                const data = await response.json();
                updateWeatherUI(data);
                updateMap(latitude, longitude);
            } catch (error) {
                alert(error.message);
            }
        });
    } else {
        alert("Geolocation not supported.");
    }
});

// Search city weather
searchBtn.addEventListener("click", () => {
    const city = document.getElementById("city_input").value.trim();
    if (city) fetchWeather(city);
    else alert("Please enter a city name");
});

// Save location
saveLocationBtn.addEventListener("click", () => {
    if (currentLocation) {
        let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
        savedLocations.push(currentLocation);
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        loadSavedLocations();
    }
});

// Load saved locations
const loadSavedLocations = () => {
    savedLocationsList.innerHTML = "";
    const savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
    savedLocations.forEach(loc => {
        const li = document.createElement("li");
        li.textContent = loc.name;
        li.addEventListener("click", () => fetchWeather(loc.name));
        savedLocationsList.appendChild(li);
    });
};

// Load saved locations on page load
loadSavedLocations();
