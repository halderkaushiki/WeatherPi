document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5def5d810f04b5cb0b09a4098f998d10'; // <-- PASTE YOUR API KEY HERE

    const searchButton = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherInfoDiv = document.getElementById('weather-info');
    const errorMessage = document.getElementById('error-message');

    // Function to handle both button click and 'Enter' key press
    const performSearch = () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    };

    searchButton.addEventListener('click', performSearch);
    cityInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    const getWeatherData = async (city) => {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            // Fetch both current weather and forecast data in parallel
            const [currentWeatherResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl),
            ]);
            
            if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found or API error.');
            }

            const currentWeatherData = await currentWeatherResponse.json();
            const forecastData = await forecastResponse.json();
            
            displayCurrentWeather(currentWeatherData);
            displayForecast(forecastData);

            weatherInfoDiv.classList.remove('hide');
            errorMessage.classList.add('hide');

        } catch (error) {
            console.error('Error fetching weather data:', error);
            weatherInfoDiv.classList.add('hide');
            errorMessage.classList.remove('hide');
        }
    };

    const displayCurrentWeather = (data) => {
        document.getElementById('city-name').textContent = data.name;
        
        const tempCelsius = Math.round(data.main.temp);
        const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);
        document.getElementById('temperature').textContent = `${tempCelsius}°C / ${tempFahrenheit}°F`;
        
        document.getElementById('weather-description').textContent = data.weather[0].description;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `${data.wind.speed.toFixed(1)} m/s`;
        
        const iconCode = data.weather[0].icon;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    const displayForecast = (data) => {
        const forecastCardsContainer = document.getElementById('forecast-cards');
        forecastCardsContainer.innerHTML = ''; // Clear previous forecast cards

        // Filter to get one forecast per day (around midday)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const tempHigh = Math.round(day.main.temp_max);
            const tempLow = Math.round(day.main.temp_min);

            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                <p class="temp">${tempHigh}° / ${tempLow}°</p>
            `;
            forecastCardsContainer.appendChild(card);
        });
    };
});