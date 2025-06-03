"use client"

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { LocationSelector } from '@/components/weather/location-selector';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  description: string;
  icon: string;
  alerts?: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

interface ForecastData extends Omit<WeatherData, 'alerts'> {
  timestamp: string;
}

export default function WeatherDashboard() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('London, UK');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current weather
        const currentRes = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
        if (!currentRes.ok) throw new Error('Failed to fetch current weather');
        const currentData = await currentRes.json();
        setCurrentWeather(currentData);

        // Fetch forecast
        const forecastRes = await fetch(`/api/weather?type=forecast&location=${encodeURIComponent(location)}`);
        if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await forecastRes.json();
        setForecast(forecastData);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Weather Dashboard</h1>
      
      <LocationSelector 
        onLocationChange={handleLocationChange}
        currentLocation={location}
      />

      {/* Current Weather */}
      {currentWeather && (
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Conditions</h2>
              <div className="flex items-center">
                <img
                  src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`}
                  alt={currentWeather.description}
                  className="w-16 h-16"
                />
                <div>
                  <div className="text-3xl">{currentWeather.temperature}°C</div>
                  <div className="text-gray-600 capitalize">{currentWeather.description}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="space-y-2">
                <div>Humidity: {currentWeather.humidity}%</div>
                <div>Wind: {currentWeather.windSpeed} m/s {currentWeather.windDir}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Weather Alerts */}
      {currentWeather?.alerts && currentWeather.alerts.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Weather Alerts</h2>
          {currentWeather.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'HIGH' ? 'destructive' : 'default'}>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>{alert.type}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Forecast */}
      <div>
        <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <Card key={index} className="p-4">
              <div className="text-center">
                <div className="font-medium">
                  {new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.description}
                  className="w-16 h-16 mx-auto"
                />
                <div className="text-2xl">{day.temperature}°C</div>
                <div className="text-sm text-gray-600 capitalize">{day.description}</div>
                <div className="text-sm">
                  Wind: {day.windSpeed} m/s {day.windDir}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}