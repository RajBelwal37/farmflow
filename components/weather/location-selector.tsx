"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Crosshair2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface LocationSelectorProps {
  onLocationChange: (location: string) => void;
  currentLocation: string;
}

export function LocationSelector({ onLocationChange, currentLocation }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    console.log('Starting geolocation process...');
    console.log('API Key available:', !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    // Test geolocation first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Successfully got coordinates:', { latitude, longitude });

          // Test API call separately
          const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
          console.log('Attempting to fetch location data...');
          
          try {
            const response = await fetch(apiUrl);
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error:', errorText);
              throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);

            if (data && Array.isArray(data) && data.length > 0) {
              const locationName = `${data[0].name}, ${data[0].country}`;
              console.log('Setting location to:', locationName);
              onLocationChange(locationName);
            } else {
              // Fallback to coordinate-based location
              const coordLocation = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
              console.log('Using coordinate fallback:', coordLocation);
              onLocationChange(coordLocation);
            }
          } catch (apiError) {
            console.error('API call failed:', apiError);
            // Still use coordinates if API fails
            const coordLocation = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
            console.log('Using coordinate fallback due to API error:', coordLocation);
            onLocationChange(coordLocation);
            setError('Could not get location name, using coordinates instead');
          }
        } catch (err) {
          console.error('Error in location process:', err);
          setError('Failed to process location data');
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        let errorMessage = 'Could not get location: ';
        switch (geoError.code) {
          case 1:
            errorMessage += 'Please allow location access in your browser settings';
            break;
          case 2:
            errorMessage += 'Position unavailable';
            break;
          case 3:
            errorMessage += 'Request timed out';
            break;
          default:
            errorMessage += geoError.message;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      geoOptions
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onLocationChange(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <Crosshair2Icon className="mr-2 h-4 w-4" />
            {isLoading ? 'Detecting Location...' : 'Use Current Location'}
          </Button>
          <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
            <Input
              type="text"
              placeholder="Enter city name (e.g., London, UK)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </form>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {currentLocation && (
          <div className="text-sm text-gray-600">
            Current Location: {currentLocation}
          </div>
        )}
      </div>
    </Card>
  );
} 