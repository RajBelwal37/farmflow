import { prisma } from './prisma';

interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  private convertKelvinToCelsius(kelvin: number): number {
    return Math.round((kelvin - 273.15) * 10) / 10;
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  async getCurrentWeather(lat: number, lon: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }

      const data: WeatherResponse = await response.json();

      const weatherData = {
        temperature: this.convertKelvinToCelsius(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDir: this.getWindDirection(data.wind.deg),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: `${lat},${lon}`,
      };

      // Store in database
      await prisma.weatherData.create({
        data: weatherData,
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  async getForecast(lat: number, lon: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Forecast data fetch failed');
      }

      const data: ForecastResponse = await response.json();

      return data.list.map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: this.convertKelvinToCelsius(item.main.temp),
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        windDir: this.getWindDirection(item.wind.deg),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      }));
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  async checkForAlerts(weatherData: any) {
    const alerts = [];

    // Temperature alerts
    if (weatherData.temperature > 35) {
      alerts.push({
        type: 'HEAT',
        severity: 'HIGH',
        message: 'Extreme heat warning. Ensure proper irrigation.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    }

    // Wind alerts
    if (weatherData.windSpeed > 20) {
      alerts.push({
        type: 'WIND',
        severity: 'MEDIUM',
        message: 'Strong winds expected. Secure equipment and check crop supports.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      });
    }

    // Create alerts in database
    for (const alert of alerts) {
      await prisma.weatherAlert.create({
        data: alert,
      });
    }

    return alerts;
  }
} 