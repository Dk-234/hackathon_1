import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaBolt, FaCloudSun, FaWind } from 'react-icons/fa';

const WeatherForecast = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        err => {
          console.error('Geolocation error:', err);
          // Default to a major city if geolocation fails
          fetchWeatherByCity('New York');
        }
      );
    } else {
      // Geolocation not supported
      fetchWeatherByCity('New York');
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      // Use a valid API key for OpenWeatherMap
      const apiKey = '1d85731d7c3f717adbc0c9dc19e01a9f'; // Demo key, replace with your own in production
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      setWeather(response.data);
      setLocation(`${response.data.name}, ${response.data.sys.country}`);
      setLoading(false);
    } catch (error) {
      console.error('Weather API error:', error);
      setError('Failed to load weather data');
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    try {
      // Use the same API key here
      const apiKey = '1d85731d7c3f717adbc0c9dc19e01a9f'; // Demo key, replace with your own in production
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      setWeather(response.data);
      setLocation(`${response.data.name}, ${response.data.sys.country}`);
      setLoading(false);
    } catch (error) {
      console.error('Weather API error:', error);
      setError('Failed to load weather data');
      setLoading(false);
    }
  };

  // Get weather icon based on weather code
  const getWeatherIcon = (code) => {
    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (code >= 200 && code < 300) return <FaBolt color="#FFD700" size={24} />; // Thunderstorm
    if (code >= 300 && code < 500) return <FaCloudRain color="#87CEFA" size={24} />; // Drizzle
    if (code >= 500 && code < 600) return <FaCloudRain color="#1E90FF" size={24} />; // Rain
    if (code >= 600 && code < 700) return <FaSnowflake color="#FFFFFF" size={24} />; // Snow
    if (code >= 700 && code < 800) return <FaWind color="#DCDCDC" size={24} />; // Atmosphere
    if (code === 800) return <FaSun color="#FFD700" size={24} />; // Clear
    if (code > 800) return <FaCloudSun color="#DCDCDC" size={24} />; // Clouds
    return <FaCloud color="#DCDCDC" size={24} />; // Default
  };

  // For demo/development, use mock data if API key is not set
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !weather && !loading) {
      // Mock data for development
      setWeather({
        main: { temp: 22, feels_like: 23, humidity: 65 },
        weather: [{ id: 800, description: 'clear sky' }],
        wind: { speed: 3.5 },
      });
      setLocation('New York, US');
      setLoading(false);
    }
  }, [loading, weather]);

  if (loading) {
    return (
      <div className="weather-forecast-container">
        <div className="d-flex justify-content-center align-items-center py-2">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading weather forecast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-forecast-container">
        <div className="alert alert-warning py-1 mb-0">{error}</div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-forecast-container mb-3">
      <div className="weather-slider">
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <div className="d-flex align-items-center">
            {getWeatherIcon(weather.weather[0].id)}
            <div className="ms-2">
              <span className="temperature">{Math.round(weather.main.temp)}°C</span>
              <span className="weather-description ms-2 text-capitalize">
                {weather.weather[0].description}
              </span>
            </div>
          </div>
          
          <div className="location">{location}</div>
          
          <div className="weather-details d-none d-md-flex">
            <div className="me-3">
              <small>Feels like: {Math.round(weather.main.feels_like)}°C</small>
            </div>
            <div className="me-3">
              <small>Humidity: {weather.main.humidity}%</small>
            </div>
            <div>
              <small>Wind: {Math.round(weather.wind.speed)} m/s</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
