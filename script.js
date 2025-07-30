// api_key = '25854bf2095a5b06dc33e2603dc8e4ad',
let cityInput = document.getElementById('city_input'),
searchBtn = document.getElementById('searchBtn'),
locationBtn = document.getElementById('locationBtn'),
voiceSearchButton = document.getElementById('voiceSearchButton'),
api_key = '25854bf2095a5b06dc33e2603dc8e4ad',
currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
fiveDaysForecastCard = document.querySelector('.day-forecast'),
aqiCard = document.querySelectorAll('.highlights .card')[0],
sunriseCard = document.querySelectorAll('.highlights .card')[1],
humidityVal = document.getElementById('humidityVal'),
pressureVal = document.getElementById('pressureVal'),
hourlyForecastCard = document.querySelector('.hourly-forecast'),
aqiList = ['Good', 'Fair', 'Moderate', 'Poor','Very Poor'];

function getWeatherDetails(name, lat , lon , country, state){
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
    days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],
    months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'

    ];
   
    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
        aqiCard.innerHTML = `
        <div class="card-head">
            <p>Air Quality Index</p>
            <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
        </div>
        <div class="air-indices">
            <i class="fa-regular fa-wind fa-3x"></i>
            <div class="item">
                <p>PM2.5</p>
                <h2>${pm2_5}</h2>
            </div>
            <div class="item">
                <p>PM10</p>
                <h2>${pm10}</h2>
            </div>
            <div class="item">
                <p>SO2</p>
                <h2>${so2}</h2>
            </div>
            <div class="item">
                <p>CO</p>
                <h2>${co}</h2>
            </div>
            <div class="item">
                <p>NO</p>
                <h2>${no}</h2>
            </div>
            <div class="item">
                <p>NO2</p>
                <h2>${no2}</h2>
            </div>
            <div class="item">
                <p>NH3</p>
                <h2>${nh3}</h2>
            </div>
            <div class="item">
                <p>O3</p>
                <h2>${o3}</h2>
            </div>
         </div>

    `;
    }).catch(() => {
        alert('Failed to fetch Air Quality weather');
   
    });



    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
      let date = new Date();
      currentWeatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>Now</p>
                    <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                    <p>${data.weather[0].description}</p>  
                </div>
                <div class="weather-icons">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
            </div>
        `;
        let {sunrise, sunset} = data.sys
        let {timezone, visibility} = data,
        {humidity,pressure,feels_like} = data.main,
        {speed} = data.wind;
        sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'second').format('hh:mm A'),
        sSetTime = moment.utc(sunset, 'X').add(timezone, 'second').format('hh:mm A'),
        sunriseCard.innerHTML = `
                <div class="card-head">
                    <p>Sunrise & Sunset</p>
                </div>
                <div class="sunrise-sunset">
                    <div class="item">
                        <div class="icon">
                             <i class="fa-light fa-sunrise fa-4x"></i>
                        </div>
                        <div>
                            <p>Sunrise</p>
                            <h2>${sRiseTime}</h2>
                        </div>
                    </div>
                    <div class="item">
                        <div class="icon">
                            <i class="fa-light fa-sunset fa-4x"></i>
                        </div>
                        <div>
                            <p>Sunset</p>
                            <h2>${sSetTime}</h2>
                    </div>
                </div>
            </div>
        `;
        humidityVal.innerHTML = `${humidity}%`;
        pressureVal.innerHTML = `${pressure}hPa`;
       
    }).catch(() => {
        alert('Failed to fetch current weather');
    });

    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let hourlyForecast = data.list;
        hourlyForecastCard.innerHTML = '';
        for(i = 0; i <= 7; i++){
            let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
            let hr = hrForecastDate.getHours();
            let a = 'PM';
            if(hr < 12) a = 'AM';
            if(hr == 0) hr = 12;
            if(hr > 12) hr = hr - 12;
            hourlyForecastCard.innerHTML += `
                <div class="card">
                    <p>${hr} ${a}</p>
                    <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                    <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                </div>
            `;
        }
        let uniqueForecastDays = [];
        let fiveDaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });
        fiveDaysForecastCard.innerHTML = '';
        for(i = 1; i< fiveDaysForecast.length; i++){
            let date = new Date(fiveDaysForecast[i].dt_txt);
            fiveDaysForecastCard.innerHTML += `
                <div class="forecast-item">
                    <div class="icon-wrapper">
                        <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png"
                        alt="">
                        <span>${(fiveDaysForecast[i].main.temp -  273.15).toFixed(2)}&deg;C</span>
                    </div>
                    <p>${date.getDate()} ${months[date.getMonth()]}</p>
                    <p>${days[date.getDay()]}</p>
                </div>
            `;

            
    let forecastData = {
        city: name,
        country: country,
        state: state,
        forecast: data.list.slice(0, 5).map(item => ({
            date: item.dt_txt,
            temperature: (item.main.temp - 273.15).toFixed(2),
            description: item.weather[0].description,
            icon: item.weather[0].icon
        }))
    };

    // Send forecast data to backend for storage
    fetch("http://localhost:5000/saveForecast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(forecastData)
    }).then(res => res.json()).then(response => {
        console.log("Forecast saved:", response);
    }).catch(error => console.error("Error saving forecast:", error));


       
        }
    }).catch(() => {
        alert('Failed to fetch weather forecast')
    });
}


function getCityCoordinates(){
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if(!cityName) return;
    let GEOCODING_API_URL_ = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL_).then(res => res.json()).then(data => {
        let {name, lat , lon , country, state} = data[0];
        getWeatherDetails(name, lat , lon , country, state);
    }).catch(() => {
        alert(`Failed to fetch coordinates of ${cityName}`);
    });

    fetch(GEOCODING_API_URL_).then(res => res.json()).then(data => {
    let {name} = data[0];

    // Instead of calling getWeatherDetails directly, fetch from the backend
    getWeather(name);
}).catch(() => {
    alert(`Failed to fetch coordinates of ${cityName}`);
});

 
}

voiceSearchButton.addEventListener("click", () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            cityInput.value = transcript;
            getCityCoordinates();
        };

        recognition.onerror = () => {
            alert("Voice recognition error. Try again.");
        };
    } else {
        alert("Voice search not supported in this browser.");
    }
});

function getUserCoordinates(){
    navigator.geolocation.getCurrentPosition(position => {
        let {latitude, longitude} =position.coords;
        let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

        fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
            let {name, country, state} = data[0];
            getWeatherDetails(name, latitude, longitude, country, state);
        }).catch(() => {
            alert('Failed to fetch user coordinates');
        });
    }, error => {
        alert('Geolocation permission denied. Please reset location permission to grant access again');
    });
}

function loadSavedForecasts() {
    fetch("http://localhost:5000/getForecasts")
    .then(res => res.json())
    .then(data => {
        console.log("Saved Forecasts:", data);
    })
    .catch(error => console.error("Error fetching saved forecasts:", error));
}

async function getWeather(city) {
    const response = await fetch(`http://localhost:5000/get_forecast?city=${city}`);
    const data = await response.json();
    
    if (data.error) {
        console.error("Error:", data.error);
        return;
    }

    console.log(data);
    // You can use this data to update the UI accordingly
}

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
// window.addEventListener('load', getUserCoordinates);
window.addEventListener('load', () => {
    getUserCoordinates();
   loadSavedForecasts(); // Fetch stored forecasts on page load
});

// /Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Simulating admin check (Replace this with actual role-based logic)
    const isAdmin = localStorage.getItem("role") === "admin"; 

    // Get the populate button
    const populateButton = document.getElementById("populateDataBtn");

    // Show the button only if the user is an admin
    if (isAdmin && populateButton) {
        populateButton.style.display = "inline-block";
    }

    // Event listener for button click
    if (populateButton) {
        populateButton.addEventListener("click", async function () {
            try {
                const response = await fetch("http://localhost:5000/api/populateData", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                const result = await response.json();
                alert(result.message);
            } catch (error) {
                console.error("Error populating data:", error);
            }
        });
    }
});

document.getElementById("populateDataBtn").addEventListener("click", async () => {
    const city = document.getElementById("city_input").value.trim(); // Get city name

    if (!city) {
        alert("Please enter a city name first.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/weather/${city}`, {
            method: "GET",
        });

        const data = await response.json();
        console.log("Weather data saved:", data);
        alert("Weather data saved successfully!");
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to save weather data.");
    }
});


