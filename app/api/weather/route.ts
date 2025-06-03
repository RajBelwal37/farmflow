import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/src/services/weather-service';

const weatherService = new WeatherService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const location = searchParams.get('location');

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    if (type === 'forecast') {
      const forecast = await weatherService.getWeatherForecast(location);
      return NextResponse.json(forecast);
    }

    const currentWeather = await weatherService.getCurrentWeather(location);
    return NextResponse.json(currentWeather);
  } catch (error) {
    console.error('Error in weather API:', error);
    if (error instanceof Error) {
      if (error.message === 'Location not found') {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 