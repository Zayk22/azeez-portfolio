// ===== CONFIGURATION =====
const API_KEY = "06a2b5ba574ac83b9bcbd1c23df52614";
const DEFAULT_CITY = "Lagos";

// ===== DOM ELEMENTS =====
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    celsiusBtn: document.getElementById('celsiusBtn'),
    fahrenheitBtn: document.getElementById('fahrenheitBtn'),
    weatherCard: document.getElementById('weatherCard'),
    errorMsg: document.getElementById('errorMsg'),
    cityName: document.getElementById('cityName'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDesc: document.getElementById('weatherDesc'),
    temperature: document.getElementById('temperature'),
    tempUnit: document.getElementById('tempUnit'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    forecastContainer: document.getElementById('forecastContainer'),
    forecastGrid: document.getElementById('forecastGrid')
};

// ===== STATE =====
let state = {
    isCelsius: true,
    currentTempCelsius: null,
    currentCity: DEFAULT_CITY
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDefaultCity();
});

function setupEventListeners() {
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    elements.celsiusBtn.addEventListener('click', () => setUnit(true));
    elements.fahrenheitBtn.addEventListener('click', () => setUnit(false));
}

function setUnit(isCelsius) {
    if (state.isCelsius === isCelsius) return;
    
    state.isCelsius = isCelsius;
    
    // Update button states
    elements.celsiusBtn.classList.toggle('active', isCelsius);
    elements.fahrenheitBtn.classList.toggle('active', !isCelsius);
    
    // Update temperature display if we have data
    if (state.currentTempCelsius !== null) {
        updateTemperatureDisplay();
    }
}

// ===== MAIN WEATHER FLOW =====
async function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        showError("Please enter a city name");
        return;
    }
    
    state.currentCity = city;
    await fetchWeatherData(city);
}

async function fetchWeatherData(city) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!currentResponse.ok) {
            throw new Error("City not found");
        }
        
        const currentData = await currentResponse.json();
        
        // Store temperature in Celsius
        state.currentTempCelsius = currentData.main.temp;
        
        // Display current weather
        displayCurrentWeather(currentData);
        
        // Fetch and display forecast
        await fetchForecastData(city);
        
        hideError();
    } catch (error) {
        showError(error.message);
        elements.weatherCard.style.display = 'none';
        elements.forecastContainer.style.display = 'none';
    }
}

// ===== CURRENT WEATHER =====
function displayCurrentWeather(data) {
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.weatherDesc.textContent = data.weather[0].description;
    
    // Update temperature display
    updateTemperatureDisplay();
    
    elements.humidity.textContent = data.main.humidity;
    elements.windSpeed.textContent = (data.wind.speed * 3.6).toFixed(1);
    
    // Set weather icon
    const iconCode = data.weather[0].icon;
    elements.weatherIcon.className = `wi wi-owm-${iconCode}`;
    
    // Show weather card with animation
    elements.weatherCard.style.display = 'block';
    elements.weatherCard.style.animation = 'none';
    elements.weatherCard.offsetHeight; // Force reflow
    elements.weatherCard.style.animation = 'slideIn 0.3s ease';
}

function updateTemperatureDisplay() {
    if (state.currentTempCelsius === null) return;
    
    let temp;
    if (state.isCelsius) {
        temp = Math.round(state.currentTempCelsius);
        elements.tempUnit.textContent = '°C';
    } else {
        temp = Math.round((state.currentTempCelsius * 9/5) + 32);
        elements.tempUnit.textContent = '°F';
    }
    
    elements.temperature.textContent = temp;
}

// ===== FORECAST =====
async function fetchForecastData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error("Forecast data unavailable");
        }
        
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Forecast error:", error);
        elements.forecastContainer.style.display = 'none';
    }
}

function displayForecast(data) {
    elements.forecastGrid.innerHTML = '';
    
    // Get daily forecasts (API returns 3-hour intervals, every 8th is a new day)
    const dailyForecasts = [];
    for (let i = 0; i < data.list.length; i += 8) {
        dailyForecasts.push(data.list[i]);
    }
    
    // Create forecast cards
    dailyForecasts.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        // Store temperatures in Celsius for conversion
        const tempHighCelsius = day.main.temp_max;
        const tempLowCelsius = day.main.temp_min;
        
        // Convert if needed
        let tempHigh, tempLow;
        if (state.isCelsius) {
            tempHigh = Math.round(tempHighCelsius);
            tempLow = Math.round(tempLowCelsius);
        } else {
            tempHigh = Math.round((tempHighCelsius * 9/5) + 32);
            tempLow = Math.round((tempLowCelsius * 9/5) + 32);
        }
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-day';
        forecastCard.innerHTML = `
            <div class="day-name">${dayName}</div>
            <i class="wi wi-owm-${day.weather[0].id}"></i>
            <div class="forecast-temp">
                <span class="high">${tempHigh}°</span>
                <span class="low">${tempLow}°</span>
            </div>
        `;
        
        elements.forecastGrid.appendChild(forecastCard);
    });
    
    elements.forecastContainer.style.display = 'block';
    elements.forecastContainer.style.animation = 'fadeIn 0.5s ease';
}

// ===== UTILITIES =====
function showError(message) {
    elements.errorMsg.textContent = message;
    elements.errorMsg.style.animation = 'fadeIn 0.3s ease';
    setTimeout(() => {
        elements.errorMsg.style.animation = '';
    }, 300);
}

function hideError() {
    elements.errorMsg.textContent = '';
}

function loadDefaultCity() {
    elements.cityInput.value = DEFAULT_CITY;
    fetchWeatherData(DEFAULT_CITY);
}

// ===== UNIT CONVERSION FOR FORECAST (update when unit changes) =====
// Override setUnit to also refresh forecast display
const originalSetUnit = setUnit;
setUnit = function(isCelsius) {
    if (state.isCelsius === isCelsius) return;
    
    state.isCelsius = isCelsius;
    elements.celsiusBtn.classList.toggle('active', isCelsius);
    elements.fahrenheitBtn.classList.toggle('active', !isCelsius);
    
    if (state.currentTempCelsius !== null) {
        updateTemperatureDisplay();
    }
    
    // Refresh forecast display with new units if visible
    if (elements.forecastContainer.style.display === 'block' && state.currentCity) {
        fetchForecastData(state.currentCity);
    }
};

// Reassign the function
window.setUnit = setUnit;
elements.celsiusBtn.removeEventListener('click', () => setUnit(true));
elements.fahrenheitBtn.removeEventListener('click', () => setUnit(false));
elements.celsiusBtn.addEventListener('click', () => setUnit(true));
elements.fahrenheitBtn.addEventListener('click', () => setUnit(false));