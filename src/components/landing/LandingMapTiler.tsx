// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Landing Page MapTiler - Real Neon Map with Prize Markers

import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Car, Watch, Gem, ShoppingBag, Smartphone, Gift, Trophy } from 'lucide-react';
import { mapTilerConfig } from '@/config/maptiler';
import neonStyle from '@/pages/map/styles/m1_neon_style_FULL_3D.json';

// Prize marker data with real coordinates (Rome area)
const prizeMarkers = [
  {
    id: 1,
    name: 'Ferrari Purosangue',
    category: 'Auto di Lusso',
    icon: Car,
    coords: [12.4964, 41.9028], // Rome center
    image: '/assets/prizes/auto-reali/FERRARI_PUROSANGUE.png',
    value: '€390.000',
  },
  {
    id: 2,
    name: 'Rolex Day-Date',
    category: 'Orologi Preziosi',
    icon: Watch,
    coords: [12.4534, 41.8902], // Colosseum area
    image: '/assets/prizes/orologi-reali/ROLEX DAY-DATE.png',
    value: '€45.000',
  },
  {
    id: 3,
    name: 'Hermès Birkin',
    category: 'Borse di Alta Moda',
    icon: ShoppingBag,
    coords: [12.4823, 41.8919], // Trastevere
    image: '/assets/prizes/borse-reali/HERMES_BIRKIN.png',
    value: '€12.000',
  },
  {
    id: 4,
    name: 'iPhone Pro Max',
    category: '99 Premi',
    icon: Smartphone,
    coords: [12.5208, 41.9109], // EUR
    image: '/assets/prizes/99premi/IPHONE.png',
    value: '€1.599',
  },
  {
    id: 5,
    name: 'Diamante 2 Carati',
    category: 'Gioielli Esclusivi',
    icon: Gem,
    coords: [12.4730, 41.9097], // Vatican area
    image: '/assets/prizes/gioielli-reali/DIAMANTI.png',
    value: '€25.000',
  },
  {
    id: 6,
    name: 'MacBook Pro',
    category: '99 Premi',
    icon: Gift,
    coords: [12.5117, 41.8825], // Circo Massimo
    image: '/assets/prizes/99premi/MACBOOK.png',
    value: '€3.499',
  },
  {
    id: 7,
    name: 'Premio Principale',
    category: 'Grand Prize',
    icon: Trophy,
    coords: [12.4922, 41.9029], // Pantheon area
    image: '/assets/prizes/auto-reali/LAMBORGHINI.png',
    value: '???',
  },
];

interface SelectedPrize {
  id: number;
  name: string;
  category: string;
  image: string;
  value: string;
  icon: React.ElementType;
}

const LandingMapTiler: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<SelectedPrize | null>(null);
  const [mapError, setMapError] = useState(false);

  // Create marker element
  const createMarkerElement = useCallback((prize: typeof prizeMarkers[0]) => {
    const el = document.createElement('div');
    el.className = 'landing-prize-marker';
    el.innerHTML = `
      <div class="marker-pulse"></div>
      <div class="marker-body">
        <div class="marker-icon"></div>
      </div>
    `;
    
    // Style the marker
    el.style.cssText = `
      width: 48px;
      height: 48px;
      position: relative;
      cursor: pointer;
    `;
    
    const pulse = el.querySelector('.marker-pulse') as HTMLElement;
    if (pulse) {
      pulse.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.4);
        animation: markerPulse 2s ease-out infinite;
      `;
    }
    
    const body = el.querySelector('.marker-body') as HTMLElement;
    if (body) {
      body.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.2);
        border: 3px solid #22C55E;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3);
        transition: all 0.3s ease;
      `;
    }
    
    const icon = el.querySelector('.marker-icon') as HTMLElement;
    if (icon) {
      icon.style.cssText = `
        width: 20px;
        height: 20px;
        background: #22C55E;
        border-radius: 50%;
      `;
    }
    
    // Hover effects
    el.addEventListener('mouseenter', () => {
      if (body) {
        body.style.transform = 'scale(1.2)';
        body.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.5)';
      }
    });
    
    el.addEventListener('mouseleave', () => {
      if (body) {
        body.style.transform = 'scale(1)';
        body.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)';
      }
    });
    
    return el;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const apiKey = mapTilerConfig.getKey();
    if (!apiKey) {
      console.warn('[LandingMap] No MapTiler API key available');
      setMapError(true);
      return;
    }

    // Process neon style with API key
    const processedStyle = JSON.parse(JSON.stringify(neonStyle));
    
    if (processedStyle.sources) {
      Object.keys(processedStyle.sources).forEach((sourceKey) => {
        const source = processedStyle.sources[sourceKey];
        if (source.url) {
          source.url = source.url.replace('{key}', apiKey).replace('YOUR_MAPTILER_API_KEY_HERE', apiKey);
        }
        if (source.tiles) {
          source.tiles = source.tiles.map((tile: string) => 
            tile.replace('{key}', apiKey).replace('YOUR_MAPTILER_API_KEY_HERE', apiKey)
          );
        }
      });
    }
    
    if (processedStyle.glyphs) {
      processedStyle.glyphs = processedStyle.glyphs.replace('{key}', apiKey).replace('YOUR_MAPTILER_API_KEY_HERE', apiKey);
    }

    console.log('[LandingMap] Initializing MapTiler with Neon style...');

    try {
      const initialMap = new maplibregl.Map({
        container: mapContainer.current,
        style: processedStyle,
        center: [12.4964, 41.9028], // Rome
        zoom: 12,
        pitch: 45,
        bearing: -17,
        attributionControl: false,
        interactive: true,
      });

      map.current = initialMap;

      initialMap.on('load', () => {
        console.log('[LandingMap] ✅ Map loaded');
        setMapLoaded(true);
        
        // Add markers
        prizeMarkers.forEach((prize) => {
          const el = createMarkerElement(prize);
          
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            setSelectedPrize({
              id: prize.id,
              name: prize.name,
              category: prize.category,
              image: prize.image,
              value: prize.value,
              icon: prize.icon,
            });
            
            // Fly to marker
            initialMap.flyTo({
              center: prize.coords as [number, number],
              zoom: 15,
              pitch: 60,
              duration: 1500,
            });
          });
          
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(prize.coords as [number, number])
            .addTo(initialMap);
          
          markersRef.current.push(marker);
        });

        // Add navigation controls
        initialMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      });

      initialMap.on('error', (e) => {
        console.error('[LandingMap] Error:', e);
        setMapError(true);
      });

    } catch (error) {
      console.error('[LandingMap] Failed to initialize:', error);
      setMapError(true);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [createMarkerElement]);

  // Add CSS for marker animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes markerPulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <motion.section 
      className="relative py-20 px-4 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: true }}
      >
        <motion.span 
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/30 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Mappa Live
        </motion.span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          La Mappa <span className="text-[#00E5FF]">Viva</span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto text-lg">
          I premi sono nascosti sulla mappa reale. Clicca sui marker verdi.
        </p>
      </motion.div>

      {/* Map Container */}
      <motion.div 
        className="relative max-w-6xl mx-auto h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        viewport={{ once: true }}
      >
        {/* Map */}
        <div 
          ref={mapContainer} 
          className="absolute inset-0"
          style={{ background: '#03070D' }}
        />
        
        {/* Loading overlay */}
        <AnimatePresence>
          {!mapLoaded && !mapError && (
            <motion.div 
              className="absolute inset-0 bg-[#03070D] flex items-center justify-center z-10"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-white/50">Caricamento mappa...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error fallback */}
        {mapError && (
          <div className="absolute inset-0 bg-[#03070D] flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-white/50">Mappa non disponibile</p>
            </div>
          </div>
        )}

        {/* Border glow */}
        <motion.div 
          className="absolute inset-0 rounded-3xl border border-cyan-500/20 pointer-events-none z-20"
          animate={{ 
            boxShadow: [
              '0 0 40px rgba(0,229,255,0.1), inset 0 0 40px rgba(0,229,255,0.03)',
              '0 0 60px rgba(0,229,255,0.15), inset 0 0 60px rgba(0,229,255,0.05)',
              '0 0 40px rgba(0,229,255,0.1), inset 0 0 40px rgba(0,229,255,0.03)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* HUD overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-green-500/20 z-20">
          <motion.div 
            className="w-2.5 h-2.5 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-green-400 text-xs font-semibold">
            {prizeMarkers.length} Premi Nascosti
          </span>
        </div>

        <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 z-20">
          <span className="text-white/50 text-xs">Clicca un marker verde</span>
        </div>
      </motion.div>

      {/* Prize Modal */}
      <AnimatePresence>
        {selectedPrize && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedPrize(null)}
            />
            
            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg bg-[#0a0a12] border border-cyan-500/30 rounded-3xl overflow-hidden"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedPrize(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Prize image */}
              <div className="relative h-64 md:h-80 bg-gradient-to-b from-cyan-500/10 to-transparent">
                <img
                  src={selectedPrize.image}
                  alt={selectedPrize.name}
                  className="w-full h-full object-contain p-8"
                />
              </div>
              
              {/* Prize info */}
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  {selectedPrize.category}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-2">
                  {selectedPrize.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-cyan-400">{selectedPrize.value}</span>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">Consegna Reale</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom caption */}
      <motion.p 
        className="text-center text-white/30 text-sm mt-8 max-w-lg mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        viewport={{ once: true }}
      >
        Questa è la vera mappa M1SSION. I premi reali sono nascosti così.
      </motion.p>
    </motion.section>
  );
};

export default LandingMapTiler;

