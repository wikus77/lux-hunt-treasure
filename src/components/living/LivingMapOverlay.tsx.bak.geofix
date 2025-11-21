import { useEffect, useState, useRef } from 'react';
import { weatherAdapter, type WeatherMood } from '@/lib/livingMap/weatherAdapter';
import { effectsEngine, type EffectsState } from '@/lib/livingMap/effectsEngine';
import '@/styles/living-map-effects.css';

interface LivingMapOverlayProps {
  mode?: 'auto' | '2d' | '3d';
  center?: { lat: number; lng: number };
  onEffectsChange?: (effects: EffectsState) => void;
}

const LivingMapOverlay = ({ 
  mode = 'auto', 
  center = { lat: 43.7874, lng: 7.6326 },
  onEffectsChange,
}: LivingMapOverlayProps) => {
  const [effects, setEffects] = useState<EffectsState>(effectsEngine.getState());
  const [is3D, setIs3D] = useState(mode === '3d');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Weather sync
  useEffect(() => {
    const updateWeather = async () => {
      const mood = await weatherAdapter.getWeatherMood(center.lat, center.lng);
      const newEffects = effectsEngine.applyWeatherMood(mood);
      setEffects(newEffects);
      onEffectsChange?.(newEffects);
    };

    updateWeather();
    const interval = setInterval(updateWeather, 15 * 60 * 1000); // Update every 15 min

    return () => clearInterval(interval);
  }, [center.lat, center.lng, onEffectsChange]);

  // Rain canvas animation
  useEffect(() => {
    if (!effects.rain.enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: { x: number; y: number; speed: number; length: number }[] = [];
    const dropCount = effectsEngine.getRainDropCount();

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 2 + Math.random() * 3,
        length: 10 + Math.random() * 20,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = `rgba(200, 220, 255, ${effects.rain.intensity * 0.6})`;
      ctx.lineWidth = 1;

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [effects.rain.enabled, effects.rain.intensity]);

  // Sync 3D mode
  useEffect(() => {
    setIs3D(mode === '3d');
  }, [mode]);

  return (
    <div className="living-map-overlay">
      {/* Fog/Blur Layer */}
      {effects.fog.enabled && (
        <div
          className="living-effect-fog"
          style={{
            backdropFilter: `blur(${effectsEngine.getFogBlur()}px)`,
            opacity: effects.fog.intensity,
          }}
        />
      )}

      {/* Rain Canvas */}
      {effects.rain.enabled && (
        <canvas
          ref={canvasRef}
          className="living-effect-rain"
          style={{ opacity: effects.rain.intensity }}
        />
      )}

      {/* Heat Shimmer */}
      {effects.heat.enabled && (
        <div
          className="living-effect-heat"
          style={{
            opacity: effects.heat.intensity,
            filter: `url(#heat-distortion)`,
          }}
        />
      )}

      {/* Night Overlay */}
      {effects.night.enabled && (
        <div
          className="living-effect-night"
          style={{
            opacity: effectsEngine.getNightOpacity(),
          }}
        />
      )}

      {/* Energy Ripple */}
      {effects.ripple && effects.ripple.active && (
        <div className="living-effect-ripple">
          <div className="ripple-circle" />
          <div className="ripple-circle ripple-delay-1" />
          <div className="ripple-circle ripple-delay-2" />
        </div>
      )}

      {/* SVG Filters */}
      <svg style={{ display: 'none' }}>
        <filter id="heat-distortion">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={effectsEngine.getHeatShimmer()}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
};

export default LivingMapOverlay;

// Helper: trigger ripple from outside
export const triggerEnergyRipple = (lat: number, lng: number) => {
  effectsEngine.triggerRipple(lat, lng);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
