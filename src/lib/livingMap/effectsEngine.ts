import type { WeatherMood } from './weatherAdapter';

export interface EffectConfig {
  enabled: boolean;
  intensity: number; // 0-1
}

export interface EffectsState {
  fog: EffectConfig;
  rain: EffectConfig;
  heat: EffectConfig;
  night: EffectConfig;
  ripple: { active: boolean; lat: number; lng: number; timestamp: number } | null;
}

class EffectsEngine {
  private state: EffectsState = {
    fog: { enabled: false, intensity: 0 },
    rain: { enabled: false, intensity: 0 },
    heat: { enabled: false, intensity: 0 },
    night: { enabled: false, intensity: 0 },
    ripple: null,
  };

  applyWeatherMood(mood: WeatherMood, intensity: number = 0.7): EffectsState {
    // Reset all effects
    this.state = {
      fog: { enabled: false, intensity: 0 },
      rain: { enabled: false, intensity: 0 },
      heat: { enabled: false, intensity: 0 },
      night: { enabled: false, intensity: 0 },
      ripple: this.state.ripple,
    };

    switch (mood) {
      case 'fog':
        this.state.fog = { enabled: true, intensity };
        break;
      case 'rain':
        this.state.rain = { enabled: true, intensity };
        break;
      case 'hot':
        this.state.heat = { enabled: true, intensity };
        break;
      case 'night':
        this.state.night = { enabled: true, intensity };
        break;
      case 'storm':
        this.state.rain = { enabled: true, intensity: Math.min(1, intensity * 1.2) };
        this.state.fog = { enabled: true, intensity: intensity * 0.5 };
        break;
      default:
        // clear - no effects
        break;
    }

    return { ...this.state };
  }

  triggerRipple(lat: number, lng: number): void {
    this.state.ripple = {
      active: true,
      lat,
      lng,
      timestamp: Date.now(),
    };

    // Auto-clear ripple after animation (3s)
    setTimeout(() => {
      if (this.state.ripple && this.state.ripple.timestamp === Date.now() - 3000) {
        this.state.ripple = null;
      }
    }, 3000);
  }

  clearRipple(): void {
    this.state.ripple = null;
  }

  getState(): EffectsState {
    return { ...this.state };
  }

  // Helper: calculate blur amount for fog
  getFogBlur(): number {
    if (!this.state.fog.enabled) return 0;
    return 2 + this.state.fog.intensity * 4; // 2-6px
  }

  // Helper: rain drop count
  getRainDropCount(): number {
    if (!this.state.rain.enabled) return 0;
    return Math.floor(50 + this.state.rain.intensity * 100); // 50-150 drops
  }

  // Helper: heat shimmer intensity
  getHeatShimmer(): number {
    if (!this.state.heat.enabled) return 0;
    return this.state.heat.intensity * 3; // 0-3px displacement
  }

  // Helper: night overlay opacity
  getNightOpacity(): number {
    if (!this.state.night.enabled) return 0;
    return 0.3 + this.state.night.intensity * 0.4; // 0.3-0.7
  }
}

export const effectsEngine = new EffectsEngine();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
