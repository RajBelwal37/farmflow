import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  description: string;
  icon: string;
  location: string;
}

interface WeatherAlert {
  type: string;
  severity: string;
  message: string;
  startTime: Date;
  endTime: Date;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      if (!location) {
        throw new Error('Location is required');
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      const data = response.data;
      const weatherData: WeatherData = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDir: this.getWindDirection(data.wind.deg),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: `${data.name}, ${data.sys.country}`,
      };

      // Store weather data in database
      await prisma.weatherData.create({
        data: weatherData,
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(location: string): Promise<WeatherData[]> {
    try {
      if (!location) {
        throw new Error('Location is required');
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      // Group forecast by day and get the midday forecast for each day
      const dailyForecasts = response.data.list.reduce((acc: any, item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!acc[date]) {
          acc[date] = item;
        }
        return acc;
      }, {});

      return Object.values(dailyForecasts).map((item: any) => ({
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        windDir: this.getWindDirection(item.wind.deg),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        location: location,
        timestamp: new Date(item.dt * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error('Failed to fetch weather forecast');
    }
  }

  async createWeatherAlert(alert: WeatherAlert): Promise<void> {
    try {
      await prisma.weatherAlert.create({
        data: alert,
      });
    } catch (error) {
      console.error('Error creating weather alert:', error);
      throw new Error('Failed to create weather alert');
    }
  }

  async getActiveAlerts(): Promise<WeatherAlert[]> {
    try {
      const alerts = await prisma.weatherAlert.findMany({
        where: {
          isActive: true,
        },
      });
      return alerts;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw new Error('Failed to fetch active alerts');
    }
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
} 