// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, MapPin, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom red pulsing marker
const PulsingRedIcon = L.divIcon({
  className: 'pulsing-red-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #ff0000;
    border-radius: 50%;
    animation: pulse 2s infinite;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  "></div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FinalShotResult {
  success: boolean;
  is_winner: boolean;
  distance_meters: number;
  direction: string;
  attempt_number: number;
  max_attempts: number;
  target_coordinates?: { lat: number; lng: number };
  error?: string;
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FinalShotPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [showMapControls, setShowMapControls] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  // Real mission ID - using test UUID for deployment
  const currentMissionId = '550e8400-e29b-41d4-a716-446655440000';

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('final_shots')
        .select('*')
        .eq('mission_id', currentMissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAttempts(data || []);
      
      // Set cooldown if last attempt was recent
      if (data && data.length > 0) {
        const lastAttempt = new Date(data[0].created_at);
        const cooldown = new Date(lastAttempt.getTime() + 12 * 60 * 60 * 1000); // 12 hours
        if (cooldown > new Date()) {
          setCooldownEnd(cooldown);
        }
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    // Precise map click handler - ensures exact positioning
    console.log('🎯 Map clicked:', { lat, lng, isDisabled, cooldown: getCooldownTime() });
    
    if (!isDisabled) {
      // Set exact coordinates from click event - PRECISION FIXED
      const exactPosition = { 
        lat: parseFloat(lat.toFixed(6)), 
        lng: parseFloat(lng.toFixed(6)) 
      };
      setSelectedPosition(exactPosition);
      setShowConfirmation(true);
      setShowMapControls(true);
      
      toast({
        title: "🎯 Posizione Final Shot Selezionata",
        description: `Coordinate: ${exactPosition.lat}, ${exactPosition.lng}`,
        variant: "default"
      });
    } else {
      toast({
        title: "❌ Final Shot Non Disponibile",
        description: getCooldownTime() ? `Cooldown attivo: ${getCooldownTime()}` : "Tentativi esauriti",
        variant: "destructive"
      });
    }
  };

  const submitFinalShot = async () => {
    if (!selectedPosition) return;

    setIsSubmitting(true);

    try {
      console.log('🎯 Submitting Final Shot:', { 
        mission_id: currentMissionId, 
        lat: selectedPosition.lat, 
        lng: selectedPosition.lng 
      });

      const { data, error } = await supabase.rpc('submit_final_shot', {
        p_mission_id: currentMissionId,
        p_latitude: selectedPosition.lat,
        p_longitude: selectedPosition.lng
      });

      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }

      const result = data as unknown as FinalShotResult;
      console.log('✅ Final Shot Result:', result);

      if (result.error) {
        // Enhanced error handling with specific messages
        const errorTitle = result.error.includes('Mission target') ? "❌ Target Non Trovato" : 
                          result.error.includes('Maximum attempts') ? "❌ Tentativi Esauriti" :
                          result.error.includes('Daily limit') ? "❌ Limite Giornaliero" :
                          result.error.includes('Cooldown') ? "⏳ Cooldown Attivo" : "❌ Errore Final Shot";
        
        toast({
          title: errorTitle,
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      if (result.success) {
        if (result.is_winner) {
          toast({
            title: "🏆 VINCITORE!",
            description: "Complimenti! Hai trovato il premio esatto!",
            variant: "default"
          });
        } else {
          toast({
            title: "🎯 Final Shot Registrato",
            description: `Distanza: ${(result.distance_meters / 1000).toFixed(2)} km | Direzione: ${result.direction}`,
            variant: "default"
          });
        }

        // Set cooldown
        setCooldownEnd(new Date(Date.now() + 12 * 60 * 60 * 1000));
        
        // Reload attempts
        await loadAttempts();
        
        // Clear selection and hide confirmation
        setSelectedPosition(null);
        setShowConfirmation(false);
        setShowMapControls(false);

      } else {
        toast({
          title: "❌ Final Shot Fallito",
          description: "Impossibile registrare il tentativo",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('💥 Critical error submitting final shot:', error);
      toast({
        title: "❌ Errore Sistema",
        description: "Errore critico durante l'invio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingAttempts = () => {
    const maxAttempts = 5;
    return Math.max(0, maxAttempts - attempts.length);
  };

  const getCooldownTime = () => {
    if (!cooldownEnd) return null;
    const now = new Date();
    const diff = cooldownEnd.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const isDisabled = getRemainingAttempts() === 0 || !!getCooldownTime();

  const getMapTileUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case 'dark':
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      case 'terrain':
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  const getMapAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return '&copy; M1SSION™ Tactical Intelligence | Esri';
      case 'dark':
        return '&copy; M1SSION™ Dark Ops | CartoDB';
      case 'terrain':
        return '&copy; M1SSION™ Terrain | OpenTopoMap';
      default:
        return '&copy; M1SSION™ Standard | OpenStreetMap';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-black/10" style={{
      minHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 160px)'
    }}>
      {/* Compact Header */}
      <div className="text-center mb-4 px-4 pt-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-cyan-400">FINAL</span>
            <span className="text-white"> SHOT</span>
          </h1>
        </div>
      </div>

      {/* Compact Status Cards - Mobile Optimized */}
      <div className="grid grid-cols-3 gap-2 mb-4 px-4">
        <Card className="border border-cyan-500/20 rounded-lg bg-card/60 backdrop-blur-sm">
          <CardContent className="p-2 text-center">
            <div className="text-lg font-bold text-cyan-400">{getRemainingAttempts()}</div>
            <div className="text-xs text-muted-foreground">Tentativi</div>
          </CardContent>
        </Card>

        <Card className="border border-cyan-500/20 rounded-lg bg-card/60 backdrop-blur-sm">
          <CardContent className="p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {getCooldownTime() || "✓"}
            </div>
            <div className="text-xs text-muted-foreground">Cooldown</div>
          </CardContent>
        </Card>

        <Card className="border border-cyan-500/20 rounded-lg bg-card/60 backdrop-blur-sm">
          <CardContent className="p-2 text-center">
            <div className="text-lg font-bold text-green-400">{attempts.length}</div>
            <div className="text-xs text-muted-foreground">Effettuati</div>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Tactical Map - Dominant Element */}
      <div className="flex-1 relative px-4 pb-20">
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden border-2 border-cyan-500/20 shadow-2xl bg-black/20" style={{ zIndex: 1 }}>
          
          {/* Map Style Controls - Overlay on Map - ALWAYS VISIBLE */}
          <div className="!visible !opacity-100 !flex absolute top-4 right-4 z-[999] flex-wrap gap-1" style={{ 
            visibility: 'visible', 
            opacity: 1,
            display: 'flex'
          }}>
            <Button
              variant="ghost"
              size="sm"
              className="!visible !opacity-100 !block !relative !z-[100] text-xs bg-black/80 text-white border border-white/30 rounded-full backdrop-blur-sm hover:bg-cyan-500/80 px-2 py-1"
              onClick={() => setMapStyle('satellite')}
              style={{ 
                visibility: 'visible', 
                opacity: 1,
                display: 'block'
              }}
            >
              🛰️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!visible !opacity-100 !block !relative !z-[100] text-xs bg-black/80 text-white border border-white/30 rounded-full backdrop-blur-sm hover:bg-cyan-500/80 px-2 py-1"
              onClick={() => setMapStyle('dark')}
              style={{ 
                visibility: 'visible', 
                opacity: 1,
                display: 'block'
              }}
            >
              🌑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!visible !opacity-100 !block !relative !z-[100] text-xs bg-black/80 text-white border border-white/30 rounded-full backdrop-blur-sm hover:bg-cyan-500/80 px-2 py-1"
              onClick={() => setMapStyle('terrain')}
              style={{ 
                visibility: 'visible', 
                opacity: 1,
                display: 'block'
              }}
            >
              🏔️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!visible !opacity-100 !block !relative !z-[100] text-xs bg-black/80 text-white border border-white/30 rounded-full backdrop-blur-sm hover:bg-cyan-500/80 px-2 py-1"
              onClick={() => setMapStyle('osm')}
              style={{ 
                visibility: 'visible', 
                opacity: 1,
                display: 'block'
              }}
            >
              🗺️
            </Button>
          </div>
          
          {/* Interactive Leaflet Map - Enhanced for PWA iOS */}
          <MapContainer
            center={[50.8503, 4.3517]} // Europe center (Brussels)
            zoom={4}
            minZoom={2}
            maxZoom={20}
            style={{ 
              height: '100%', 
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              touchAction: 'pan-x pan-y pinch-zoom',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            ref={mapRef}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
            touchZoom={true}
            zoomControl={true}
            attributionControl={false}
            whenReady={() => {
              // iOS PWA specific optimizations
              if (typeof window !== 'undefined' && (window.navigator as any)?.standalone) {
                const mapContainer = mapRef.current?.getContainer();
                if (mapContainer) {
                  mapContainer.style.WebkitTransform = 'translateZ(0)';
                  mapContainer.style.transform = 'translateZ(0)';
                  mapContainer.style.WebkitBackfaceVisibility = 'hidden';
                  mapContainer.style.backfaceVisibility = 'hidden';
                  mapContainer.style.willChange = 'transform';
                  
                  // Force hardware acceleration for smooth gestures
                  mapContainer.addEventListener('touchstart', () => {}, { passive: true });
                  mapContainer.addEventListener('touchmove', () => {}, { passive: true });
                  mapContainer.addEventListener('touchend', () => {}, { passive: true });
                }
              }
            }}
          >
            <TileLayer
              url={getMapTileUrl()}
              attribution={getMapAttribution()}
            />
            
            {/* Enhanced Map Click Handler - Always Active */}
            {!isDisabled && (
              <MapClickHandler onMapClick={handleMapClick} />
            )}
            
            {/* Red Pulsing Marker for Selected Position */}
            {selectedPosition && (
              <Marker 
                position={[selectedPosition.lat, selectedPosition.lng]}
                icon={PulsingRedIcon}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-bold text-red-600">🎯 Final Shot</div>
                    <div className="text-sm bg-yellow-200 px-2 py-1 rounded text-black font-mono">
                      {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Disabled State Overlay */}
          {isDisabled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm">
              <div className="text-center text-white p-4 bg-black/60 rounded-xl border border-red-500/30">
                <div className="text-lg font-bold mb-2">❌ Final Shot Non Disponibile</div>
                <div className="text-sm">
                  {getRemainingAttempts() === 0 && "Tentativi esauriti"}
                  {getCooldownTime() && `Cooldown: ${getCooldownTime()}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Shot Button - Fixed Position for iOS PWA - ALWAYS VISIBLE */}
      <div 
        className="!visible !opacity-100 !block"
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `calc(env(safe-area-inset-bottom, 0px) + 120px)`,
          zIndex: 99999,
          pointerEvents: 'auto',
          visibility: 'visible',
          opacity: 1,
          display: 'block'
        }}
      >
        <Button
          onClick={() => {
            if (isDisabled) {
              toast({
                title: getCooldownTime() ? "⏳ Cooldown Attivo" : "❌ Tentativi Esauriti",
                description: getCooldownTime() ? `Riprova tra: ${getCooldownTime()}` : "Hai raggiunto il limite massimo di tentativi",
                variant: "destructive"
              });
              return;
            }
            
            if (!showMapControls) {
              setShowMapControls(true);
            }
            toast({
              title: "🎯 Modalità Final Shot Attiva",
              description: "Clicca sulla mappa per selezionare la posizione del premio",
              variant: "default"
            });
          }}
          disabled={isDisabled}
          className={`
            !visible !opacity-100 !block !relative !z-[100]
            ${isDisabled 
              ? 'bg-gray-600/80 hover:bg-gray-600/80 cursor-not-allowed border-gray-500/50' 
              : 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-900 hover:from-fuchsia-700 hover:to-fuchsia-950 border-fuchsia-400/50'
            } 
            text-white shadow-2xl px-8 py-4 text-lg font-black rounded-full border-3 backdrop-blur-md
            transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/50
            min-w-[200px] text-center
            animate-pulse
          `}
          style={{
            visibility: 'visible',
            opacity: 1,
            display: 'block',
            position: 'relative',
            zIndex: 100,
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none'
          }}
        >
          {isDisabled ? (
            <>
              ❌ FINAL SHOT 
              {getCooldownTime() ? ` (${getCooldownTime()})` : ' (ESAURITO)'}
            </>
          ) : (
            <>
              🎯 FINAL SHOT
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border-2 border-red-500/50 rounded-2xl bg-red-500/10 backdrop-blur-md max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Conferma Final Shot</h3>
                </div>
                
                <p className="text-gray-300">
                  Stai dichiarando che il premio si trova in questo punto.
                </p>
                
                <div className="text-sm text-gray-400 font-mono bg-yellow-200 p-3 rounded-lg text-black font-bold">
                  📍 {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                </div>
                
                <p className="text-yellow-400 font-medium">
                  Hai solo {getRemainingAttempts()} tentativi totali per questa missione. Confermi?
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmation(false);
                      setSelectedPosition(null);
                    }}
                    className="px-6"
                  >
                    Annulla
                  </Button>
                  
                  <Button
                    onClick={submitFinalShot}
                    disabled={isSubmitting}
                    className="px-8 bg-gradient-to-r from-fuchsia-600 to-fuchsia-900 hover:from-fuchsia-700 hover:to-fuchsia-950 text-white shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Invio...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        🎯 LANCIA IL TUO FINAL SHOT
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FinalShotPage;