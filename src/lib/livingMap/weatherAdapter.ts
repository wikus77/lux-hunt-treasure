export type WeatherMood = 'clear' | 'rain' | 'fog' | 'hot' | 'night' | 'storm';

export interface WeatherData {
  mood: WeatherMood;
  intensity: number; // 0-1
  timestamp: string;
}

interface WeatherProvider {
  getWeather(lat: number, lng: number): Promise<WeatherData>;
}

// Stub provider for demo (Phase 1)
class DemoWeatherProvider implements WeatherProvider {
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    // Demo: cycle through moods based on time of day
    const hour = new Date().getHours();
    
    let mood: WeatherMood = 'clear';
    let intensity = 0.5;

    if (hour >= 20 || hour < 6) {
      mood = 'night';
      intensity = 0.8;
    } else if (hour >= 12 && hour < 16) {
      mood = 'hot';
      intensity = 0.6;
    } else if (Math.random() > 0.7) {
      mood = Math.random() > 0.5 ? 'rain' : 'fog';
      intensity = 0.7;
    }

    return {
      mood,
      intensity,
      timestamp: new Date().toISOString(),
    };
  }
}

// Future: OpenWeatherMap provider (commented for Phase 1)
/*
class OpenWeatherProvider implements WeatherProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Map OpenWeather conditions to moods
    const weatherId = data.weather[0].id;
    let mood: WeatherMood = 'clear';
    
    if (weatherId >= 200 && weatherId < 300) mood = 'storm';
    else if (weatherId >= 300 && weatherId < 600) mood = 'rain';
    else if (weatherId >= 700 && weatherId < 800) mood = 'fog';
    else if (data.main.temp > 303) mood = 'hot'; // > 30°C
    
    return {
      mood,
      intensity: Math.min(1, data.clouds.all / 100),
      timestamp: new Date().toISOString(),
    };
  }
}
*/

class WeatherAdapter {
  private provider: WeatherProvider;
  private cache: Map<string, { data: WeatherData; expires: number }> = new Map();
  private cacheDuration = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Phase 1: use demo provider
    const DEMO_MODE = import.meta.env.VITE_DEMO_WEATHER !== 'false';
    
    if (DEMO_MODE) {
      this.provider = new DemoWeatherProvider();
      console.log('🌤️ Weather Adapter: DEMO mode');
    } else {
      // Future: enable real provider
      this.provider = new DemoWeatherProvider();
      console.warn('⚠️ Real weather provider not configured, using demo');
    }
  }

  async getWeatherMood(lat: number, lng: number): Promise<WeatherMood> {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data.mood;
    }

    try {
      const data = await this.provider.getWeather(lat, lng);
      this.cache.set(cacheKey, {
        data,
        expires: Date.now() + this.cacheDuration,
      });
      return data.mood;
    } catch (error) {
      console.error('❌ Weather fetch failed:', error);
      return 'clear'; // Fallback
    }
  }

  async getWeatherData(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const data = await this.provider.getWeather(lat, lng);
      this.cache.set(cacheKey, {
        data,
        expires: Date.now() + this.cacheDuration,
      });
      return data;
    } catch (error) {
      console.error('❌ Weather fetch failed:', error);
      return {
        mood: 'clear',
        intensity: 0.5,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const weatherAdapter = new WeatherAdapter();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
