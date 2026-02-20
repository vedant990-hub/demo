// ==========================================
//  BACKGROUND ELEMENTS MANAGER
// ==========================================
/**
 * Creates and manages animated background elements based on weather
 */
const BackgroundManager = {
    container: document.getElementById('backgroundElements'),

    /**
     * Clears all background elements
     */
    clear() {
        this.container.innerHTML = '';
    },

    /**
     * Creates animated clouds in the background
     */
    createClouds() {
        this.clear();
        
        // Create 4-6 clouds at different heights and speeds
        const cloudCount = 5;
        const speeds = ['slow', 'medium', 'fast'];

        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            cloud.className = `cloud cloud-${speeds[i % speeds.length]}`;
            
            // Random width between 80-200px
            const width = 80 + Math.random() * 120;
            cloud.style.width = width + 'px';
            cloud.style.height = (width * 0.4) + 'px';
            
            // Random vertical position
            cloud.style.top = (Math.random() * 40) + '%';
            
            // Random animation delay
            const delay = Math.random() * 5;
            cloud.style.animationDelay = delay + 's';
            
            this.container.appendChild(cloud);
        }
    },

    /**
     * Creates falling rain animation
     */
    createRain() {
        this.clear();
        
        // Create multiple rain drops
        const raindropCount = 50;

        for (let i = 0; i < raindropCount; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop rain-fall';
            
            // Random horizontal position
            raindrop.style.left = Math.random() * 100 + '%';
            
            // Random animation delay
            const delay = Math.random() * 1;
            raindrop.style.animationDelay = delay + 's';
            
            // Vary animation speed slightly
            const duration = 0.8 + Math.random() * 0.4;
            raindrop.style.animationDuration = duration + 's';
            
            this.container.appendChild(raindrop);
        }
    },

    /**
     * Creates animated sun with rays
     */
    createSun() {
        this.clear();
        
        const sun = document.createElement('div');
        sun.className = 'sun';
        sun.style.top = '10%';
        sun.style.right = '10%';
        
        this.container.appendChild(sun);

        // Create sun rays
        const rayContainer = document.createElement('div');
        rayContainer.style.position = 'absolute';
        rayContainer.style.pointerEvents = 'none';
        rayContainer.style.width = '100%';
        rayContainer.style.height = '100%';

        // Horizontal ray
        const rayH = document.createElement('div');
        rayH.className = 'sun-ray sun-ray-horizontal';
        rayH.style.top = 'calc(10% + 46px)';
        rayH.style.right = 'calc(10% - 75px)';
        rayContainer.appendChild(rayH);

        // Vertical ray
        const rayV = document.createElement('div');
        rayV.className = 'sun-ray sun-ray-vertical';
        rayV.style.top = 'calc(10% - 75px)';
        rayV.style.right = 'calc(10% + 46px)';
        rayContainer.appendChild(rayV);

        this.container.appendChild(rayContainer);
    }
    ,
    /**
     * Creates animated moon for night phase
     */
    createMoon() {
        this.clear();

        const moon = document.createElement('div');
        moon.className = 'moon';
        moon.style.top = '12%';
        moon.style.right = '12%';

        this.container.appendChild(moon);
    }
};

// ==========================================
//  OPENWEATHER API CONFIGURATION
// ==========================================
/**
 * API Configuration for OpenWeatherMap
 * API Key is loaded from environment variable set in .env file
 */
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const TIME_API_URL = 'https://www.timeapi.io/api/Time/current/coordinate';

// Show warning if API key is not configured
if (!API_KEY || API_KEY === 'your_api_key_here' || API_KEY.trim() === '') {
    console.warn('⚠️ OpenWeatherMap API key not configured!');
    console.warn('Please:');
    console.warn('1. Sign up at: https://openweathermap.org/api');
    console.warn('2. Get your API key from: https://home.openweathermap.org/api_keys');
    console.warn('3. Add to .env file: VITE_OPENWEATHER_API_KEY=your_key_here');
}

/**
 * Weather icon mapping from OpenWeatherMap codes to emojis
 * Maps weather descriptions to visual representations
 */
const weatherIconMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '💨',
    'Haze': '🌫️',
    'Dust': '🌪️',
    'Fog': '🌫️',
    'Sand': '🌪️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
};

// ==========================================
//  DOM ELEMENTS
// ==========================================
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const localTime = document.getElementById('localTime');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const errorMessage = document.getElementById('errorMessage');

// ==========================================
//  EVENT LISTENERS
// ==========================================
// Search button click event
searchBtn.addEventListener('click', handleSearch);

// Enter key in input field for quick search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Clear error message when user starts typing
cityInput.addEventListener('input', () => {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});

// ==========================================
//  MAIN SEARCH HANDLER
// ==========================================
/**
 * Handles the search functionality
 * - Validates input
 * - Fetches real weather data from OpenWeatherMap API
 * - Displays weather with loading animation
 * 
 * @async
 */
async function handleSearch() {
    // Get and trim the input value
    const city = cityInput.value.trim();

    // Validation: Check if input is empty
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    // Validation: Check if API key is configured
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        showError('⚠️ API key not configured. Please add your OpenWeather API key to .env file');
        return;
    }

    // Clear previous error if any
    errorMessage.classList.remove('show');

    // Show weather card and start loading animation
    weatherCard.classList.remove('hidden');
    weatherCard.classList.remove('loaded');

    try {
        // Fetch weather data from OpenWeatherMap API
        const weatherData = await getWeatherData(city);

        if (weatherData) {
            const timeData = await getTimeData(weatherData.coordinates);

            // Display the weather data
            displayWeather(city, weatherData);
            updateLocalTime(timeData.timeText);
            updateBackground(weatherData.condition, timeData.hour);

            // Mark card as loaded (hides loader, shows content)
            weatherCard.classList.add('loaded');
        } else {
            // API returned empty or error response
            showError(`City not found: "${city}". Please check the spelling and try again.`);
            weatherCard.classList.add('hidden');
        }
    } catch (error) {
        // Handle all errors (network, API errors, etc.)
        console.error('Error fetching weather:', error);
        
        let errorMsg = 'Error fetching weather data';
        
        if (error.message === 'City not found') {
            errorMsg = `City not found: "${city}". Please check the spelling and try again.`;
        } else if (error.message === 'Network error') {
            errorMsg = 'Network error. Please check your internet connection.';
        } else if (error.message === 'Invalid API key') {
            errorMsg = '⚠️ Invalid API key. Please check your .env file configuration.';
        }
        
        showError(errorMsg);
        weatherCard.classList.add('hidden');
    }
}

// ==========================================
//  WEATHER DATA RETRIEVAL FROM API
// ==========================================
/**
 * Fetches real weather data from OpenWeatherMap API
 * API Endpoint: https://api.openweathermap.org/data/2.5/weather
 * 
 * @param {string} city - City name to search for
 * @returns {Promise<object|null>} Weather data object or null if not found
 * @throws {Error} Throws error for network issues or invalid API key
 * 
 * @async
 */
async function getWeatherData(city) {
    try {
        // Build API URL with query parameters
        const url = new URL(API_BASE_URL);
        url.searchParams.append('q', city);              // City name
        url.searchParams.append('appid', API_KEY);       // API key
        url.searchParams.append('units', 'metric');      // Use Celsius

        // Make the API call
        const response = await fetch(url.toString());

        // Handle HTTP error responses
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found');
            } else if (response.status === 401) {
                throw new Error('Invalid API key');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        }

        // Parse JSON response
        const data = await response.json();

        // Transform OpenWeatherMap response to our format
        const weatherData = {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            icon: weatherIconMap[data.weather[0].main] || '🌤️',
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };

        return weatherData;

    } catch (error) {
        // Re-throw custom errors
        if (error.message.includes('City not found') || 
            error.message.includes('Invalid API key') || 
            error.message.includes('API Error')) {
            throw error;
        }

        // Handle network errors
        if (error instanceof TypeError) {
            throw new Error('Network error');
        }

        // Fallback error
        throw error;
    }
}

// ==========================================
//  WEATHER DISPLAY
// ==========================================
/**
 * Displays the fetched weather data on the card
 * @param {string} city - City name
 * @param {object} data - Weather data object with temperature, condition, humidity, windSpeed, icon
 */
function displayWeather(city, data) {
    // Capitalize city name for display
    const cityDisplayName = city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Update all weather card elements with data from API
    cityName.textContent = cityDisplayName;
    temperature.textContent = data.temperature;
    weatherIcon.textContent = data.icon;
    weatherCondition.textContent = data.condition;
    humidity.textContent = `${data.humidity}%`;
    windSpeed.textContent = `${data.windSpeed} km/h`;

    // Clear input field for next search
    cityInput.value = '';
}

// ==========================================
//  TIME API + DAY PHASES
// ==========================================
/**
 * Fetches local time for a city using coordinates
 * API Endpoint: https://www.timeapi.io/api/Time/current/coordinate
 * 
 * @param {object} coordinates - { lat, lon }
 * @returns {Promise<object>} { timeText, phase }
 * 
 * @async
 */
async function getTimeData(coordinates) {
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lon !== 'number') {
        return { timeText: '', phase: 'day' };
    }

    try {
        const url = new URL(TIME_API_URL);
        url.searchParams.append('latitude', coordinates.lat);
        url.searchParams.append('longitude', coordinates.lon);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Time API Error: ${response.status}`);
        }

        const data = await response.json();

        const hour = typeof data.hour === 'number'
            ? data.hour
            : parseInt((data.time || '').split(':')[0], 10);

        const minute = typeof data.minute === 'number'
            ? data.minute
            : parseInt((data.time || '').split(':')[1], 10);

        const timeText = Number.isFinite(hour)
            ? `${pad2(hour)}:${pad2(Number.isFinite(minute) ? minute : 0)}`
            : '';

        return { timeText, hour };
    } catch (error) {
        console.warn('Time API error:', error);
        return { timeText: '', hour: null };
    }
}

/**
 * Updates the local time display
 * @param {string} timeText - Local time (HH:MM)
 */
function updateLocalTime(timeText) {
    if (!timeText) {
        localTime.textContent = 'Local time unavailable';
        return;
    }

    localTime.textContent = `Local time: ${timeText}`;
}

/**
 * Pads a number to 2 digits
 * @param {number} value
 * @returns {string}
 */
function pad2(value) {
    return String(value).padStart(2, '0');
}

// ==========================================
//  BACKGROUND THEME (WEATHER + TIME)
// ==========================================
const backgroundClasses = [
    'bg-clear-morning', 'bg-clear-afternoon', 'bg-clear-evening', 'bg-clear-night',
    'bg-clouds-morning', 'bg-clouds-afternoon', 'bg-clouds-evening', 'bg-clouds-night',
    'bg-rain-morning', 'bg-rain-afternoon', 'bg-rain-evening', 'bg-rain-night',
    'bg-snow-morning', 'bg-snow-afternoon', 'bg-snow-evening', 'bg-snow-night',
    'bg-thunderstorm-morning', 'bg-thunderstorm-afternoon', 'bg-thunderstorm-evening', 'bg-thunderstorm-night'
];

/**
 * Updates the page background based on combined weather + time phase
 * @param {string} condition - Weather condition from OpenWeather
 * @param {number|null} hour - Local hour (0-23)
 */
function updateBackground(condition, hour) {
    const weatherKey = normalizeWeatherCondition(condition);
    const timePhase = getTimePhase(hour);
    const className = `bg-${weatherKey}-${timePhase}`;

    applyBackgroundClass(className);
    applyBackgroundAnimations(weatherKey, timePhase);
}

/**
 * Normalize OpenWeather condition to supported weather keys
 * @param {string} condition
 * @returns {string}
 */
function normalizeWeatherCondition(condition) {
    const normalized = String(condition || '').toLowerCase();

    if (normalized.includes('thunder')) {
        return 'thunderstorm';
    }

    if (normalized.includes('snow')) {
        return 'snow';
    }

    if (normalized.includes('rain') || normalized.includes('drizzle')) {
        return 'rain';
    }

    if (normalized.includes('clear')) {
        return 'clear';
    }

    if (normalized.includes('cloud')) {
        return 'clouds';
    }

    return 'clouds';
}

/**
 * Determines time phase based on hour (24h)
 * Morning: 6-11, Afternoon: 12-17, Evening: 18-19, Night: 20-5
 * @param {number|null} hour
 * @returns {string}
 */
function getTimePhase(hour) {
    const safeHour = Number.isFinite(hour) ? hour : new Date().getHours();

    if (safeHour >= 6 && safeHour <= 11) {
        return 'morning';
    }

    if (safeHour >= 12 && safeHour <= 17) {
        return 'afternoon';
    }

    if (safeHour >= 18 && safeHour <= 19) {
        return 'evening';
    }

    return 'night';
}

/**
 * Applies exactly one background class on body
 * @param {string} className
 */
function applyBackgroundClass(className) {
    document.body.classList.remove(
        ...backgroundClasses,
        'clear-weather',
        'cloudy-weather',
        'rainy-weather',
        'phase-day',
        'phase-evening',
        'phase-night'
    );
    document.body.classList.add(className);
}

/**
 * Applies background animations based on weather + time phase
 * @param {string} weatherKey
 * @param {string} timePhase
 */
function applyBackgroundAnimations(weatherKey, timePhase) {
    BackgroundManager.clear();

    const showSun = weatherKey === 'clear' && (timePhase === 'morning' || timePhase === 'afternoon');
    const showMoon = weatherKey === 'clear' && timePhase === 'night';

    if (showSun) {
        BackgroundManager.createSun();
        return;
    }

    if (showMoon) {
        BackgroundManager.createMoon();
        return;
    }

    if (weatherKey === 'clouds' || weatherKey === 'snow') {
        BackgroundManager.createClouds();
        return;
    }

    if (weatherKey === 'rain' || weatherKey === 'thunderstorm') {
        BackgroundManager.createRain();
    }
}

// ==========================================
//  ERROR HANDLING
// ==========================================
/**
 * Displays error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherCard.classList.add('hidden');
}

// ==========================================
//  INITIAL STATE
// ==========================================
// Set default background on page load
updateBackground('Clouds', new Date().getHours());

// Focus on input field for better UX
cityInput.focus();

// ==========================================
//  API INTEGRATION NOTES
// ==========================================
/*
CURRENT SETUP:
   ✓ API key loaded from .env file (VITE_OPENWEATHER_API_KEY)
   ✓ Real weather data fetched from OpenWeatherMap API
   ✓ Error handling for network issues, invalid cities, and API errors
   ✓ Weather icon mapping for visual representation
   ✓ Background changes based on real weather conditions
   
ENVIRONMENT SETUP:
   1. Create a free account at: https://openweathermap.org/api
   2. Get your free API key
   3. Add to .env file: VITE_OPENWEATHER_API_KEY=your_key_here
   4. Add .env to .gitignore (already done)
   
API DOCUMENTATION:
   Endpoint: https://api.openweathermap.org/data/2.5/weather
   Parameters:
     - q: City name
     - appid: Your API key
     - units: 'metric' for Celsius (default: Kelvin)
   
   Response includes:
     - main.temp: Temperature
     - main.humidity: Humidity percentage
     - weather[0].main: Weather condition (Clear, Clouds, Rain, etc.)
     - wind.speed: Wind speed in m/s (converted to km/h)
*/
