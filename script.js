const apiKey = '60e748e50933ff614e8bfb5cff82256d'; // Replace with your OpenWeatherMap API key
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const cityName = document.getElementById('city');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');

// Function to fetch weather data
async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherInfo(data);
    } catch (error) {
        console.error('Error:', error);
        cityName.textContent = 'City not found';
    }
}

// Function to fetch weather data using coordinates
async function getWeatherByLocation(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        updateWeatherInfo(data);
    } catch (error) {
        console.error('Error:', error);
        cityName.textContent = 'Location not found';
    }
}

// Function to update weather information
function updateWeatherInfo(data) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

// Get user's location
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByLocation(lat, lon);
            },
            (error) => {
                console.error('Error:', error);
                cityName.textContent = 'Please enable location access';
            }
        );
    }
});

// Search button click event
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

// Enter key press event
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Add these constants at the top with your other constants
const suggestionsContainer = document.getElementById('suggestions');
let cities = [];

// Add this function to fetch cities that match the input
async function getSuggestions(input) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`);
        const data = await response.json();
        return data.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state
        }));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

// Add input event listener for suggestions
cityInput.addEventListener('input', async (e) => {
    const inputValue = e.target.value.trim();
    
    if (inputValue.length < 3) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const suggestions = await getSuggestions(inputValue);
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions
            .map(city => `<li>${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}</li>`)
            .join('');
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

// Add click event for suggestions
suggestionsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        cityInput.value = e.target.textContent;
        suggestionsContainer.style.display = 'none';
        getWeatherData(cityInput.value);
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
    }
});