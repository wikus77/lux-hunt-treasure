// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT TEST PAGE - Test ufficiale con dati REALI della missione

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import maplibregl, { Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FinalShootProvider, FinalShootPill, FinalShootOverlay, useFinalShootContext } from '@/components/final-shoot';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Target, MapPin, Info, AlertTriangle, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Component interno che ha accesso al context
function FinalShootTestContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [missionInfo, setMissionInfo] = useState<any>(null);
  const [loadingMission, setLoadingMission] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // Accesso al context Final Shoot
  const finalShootCtx = useFinalShootContext();

  // Carica dati missione reale
  useEffect(() => {
    const loadMissionData = async () => {
      try {
        // 🔥 FIX: Use is_active=true instead of mission_status='active'
        const { data: mission, error } = await supabase
          .from('current_mission_data')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[FinalShootTest] Error loading mission:', error);
        }
        
        setMissionInfo(mission);
        console.log('[FinalShootTest] Mission data:', mission);
      } catch (e) {
        console.error('[FinalShootTest] Exception:', e);
      } finally {
        setLoadingMission(false);
      }
    };

    loadMissionData();
  }, []);

  // Initialize map - SEMPLICE con stile dark standard
  useEffect(() => {
    if (!containerRef.current) return;

    const devKey = import.meta.env.VITE_MAPTILER_KEY_DEV || '';
    const prodKey = import.meta.env.VITE_MAPTILER_KEY_PROD || '';
    const hostname = window.location.hostname;
    const isPreview = hostname.includes('lovable') || hostname.includes('pages.dev') || hostname === 'localhost';
    const key = isPreview ? devKey : prodKey;
    
    if (!key) {
      setMapError('MapTiler API key mancante');
      console.error('❌ [FinalShootTest] MapTiler key missing');
      return;
    }

    console.log('✅ [FinalShootTest] Initializing map with key:', key.slice(0, 8) + '...');

    // Centro iniziale
    const initialCenter: [number, number] = missionInfo?.prize_lng && missionInfo?.prize_lat
      ? [missionInfo.prize_lng, missionInfo.prize_lat]
      : [12.4964, 41.9028];

    try {
      const map = new MLMap({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${key}`,
        center: initialCenter,
        zoom: 13,
        pitch: 45,
        bearing: 0,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('error', (e: any) => {
        console.error('❌ [FinalShootTest] Map error:', e);
        setMapError(e?.error?.message || 'Errore mappa');
      });

      map.on('load', () => {
        console.log('✅ [FinalShootTest] Map loaded successfully');
        setMapLoaded(true);

        // Marker e area di vincita del premio
        if (missionInfo?.prize_lat && missionInfo?.prize_lng) {
          const prizeLat = missionInfo.prize_lat;
          const prizeLng = missionInfo.prize_lng;
          
          // ========================================
          // AREA DI VINCITA 50 METRI (cerchio verde)
          // ========================================
          const WINNING_RADIUS_METERS = 50;
          
          // Genera un cerchio GeoJSON con 64 punti
          const createCircle = (centerLng: number, centerLat: number, radiusMeters: number, points: number = 64) => {
            const coords = [];
            const distanceX = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));
            const distanceY = radiusMeters / 111320;
            
            for (let i = 0; i < points; i++) {
              const angle = (i / points) * 2 * Math.PI;
              const x = centerLng + distanceX * Math.cos(angle);
              const y = centerLat + distanceY * Math.sin(angle);
              coords.push([x, y]);
            }
            coords.push(coords[0]); // Chiudi il cerchio
            
            return {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'Polygon' as const,
                coordinates: [coords]
              }
            };
          };
          
          const circleGeoJSON = createCircle(prizeLng, prizeLat, WINNING_RADIUS_METERS);
          
          // Aggiungi source per l'area di vincita
          map.addSource('winning-area', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [circleGeoJSON]
            }
          });
          
          // Layer riempimento (verde semi-trasparente)
          map.addLayer({
            id: 'winning-area-fill',
            type: 'fill',
            source: 'winning-area',
            paint: {
              'fill-color': '#00ff00',
              'fill-opacity': 0.25
            }
          });
          
          // Layer bordo (verde brillante)
          map.addLayer({
            id: 'winning-area-border',
            type: 'line',
            source: 'winning-area',
            paint: {
              'line-color': '#00ff00',
              'line-width': 3,
              'line-opacity': 0.9
            }
          });
          
          console.log('✅ [FinalShootTest] Added 50m winning area circle');
          
          // ========================================
          // MARKER DEL PREMIO (🎯)
          // ========================================
          const el = document.createElement('div');
          el.innerHTML = '🎯';
          el.style.fontSize = '40px';
          el.style.cursor = 'pointer';
          el.style.filter = 'drop-shadow(0 0 10px rgba(255,165,0,0.8))';
          
          new maplibregl.Marker({ element: el })
            .setLngLat([prizeLng, prizeLat])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
              `<div style="color: black; padding: 8px; font-family: sans-serif;">
                <b style="color: #f97316;">📍 POSIZIONE PREMIO</b><br>
                <span style="font-size: 12px;">Lat: ${prizeLat.toFixed(6)}</span><br>
                <span style="font-size: 12px;">Lng: ${prizeLng.toFixed(6)}</span><br>
                <span style="font-size: 11px; color: #22c55e;">⭕ Area vincita: ${WINNING_RADIUS_METERS}m</span>
              </div>`
            ))
            .addTo(map);
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (e: any) {
      console.error('❌ [FinalShootTest] Map init error:', e);
      setMapError(e?.message || 'Errore inizializzazione mappa');
    }
  }, [missionInfo]);

  // Vai alla posizione del premio
  const flyToPrize = () => {
    if (mapRef.current && missionInfo?.prize_lat && missionInfo?.prize_lng) {
      mapRef.current.flyTo({
        center: [missionInfo.prize_lng, missionInfo.prize_lat],
        zoom: 16,
        duration: 2000,
      });
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#070818',
      }}
    >
      {/* Header */}
      <UnifiedHeader />

      {/* Map Container - FULL SCREEN */}
      <div 
        ref={containerRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Final Shoot Overlay */}
      {mapLoaded && <FinalShootOverlay map={mapRef.current} />}

      {/* Info Panel - Collapsible */}
      <div 
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 70px)',
          left: '12px',
          right: '12px',
          maxWidth: '380px',
          zIndex: 50,
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(0,209,255,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header del panel */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{
            width: '100%',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target style={{ width: '20px', height: '20px', color: '#f97316' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', fontFamily: 'Orbitron, sans-serif' }}>
              FINAL SHOOT TEST
            </span>
            <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(249,115,22,0.2)', color: '#f97316', borderRadius: '4px' }}>
              UFFICIALE
            </span>
          </div>
          {panelOpen ? (
            <ChevronUp style={{ width: '20px', height: '20px', color: 'white' }} />
          ) : (
            <ChevronDown style={{ width: '20px', height: '20px', color: 'white' }} />
          )}
        </button>

        {/* Contenuto collassabile */}
        {panelOpen && (
          <div style={{ padding: '0 16px 16px' }}>
            {/* Status della missione */}
            <div style={{ marginBottom: '12px' }}>
              {loadingMission ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span>Caricamento dati missione...</span>
                </div>
              ) : missionInfo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '14px' }}>
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                    <span>Missione attiva trovata</span>
                  </div>
                  {missionInfo.prize_lat && missionInfo.prize_lng ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '14px' }}>
                      <MapPin style={{ width: '16px', height: '16px' }} />
                      <span>Premio: {missionInfo.prize_lat.toFixed(4)}, {missionInfo.prize_lng.toFixed(4)}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '14px' }}>
                      <XCircle style={{ width: '16px', height: '16px' }} />
                      <span>Posizione premio NON impostata!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '14px' }}>
                  <XCircle style={{ width: '16px', height: '16px' }} />
                  <span>Nessuna missione attiva</span>
                </div>
              )}
            </div>

            {/* Status Final Shoot */}
            <div style={{ 
              padding: '12px', 
              background: 'rgba(30,30,40,0.8)', 
              borderRadius: '8px', 
              marginBottom: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Disponibile:</span>
                <span style={{ color: finalShootCtx.isAvailable ? '#4ade80' : '#f87171' }}>
                  {finalShootCtx.isAvailable ? 'SÌ' : 'NO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Attivo:</span>
                <span style={{ color: finalShootCtx.isActive ? '#f97316' : '#6b7280' }}>
                  {finalShootCtx.isActive ? 'SÌ' : 'NO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Tentativi:</span>
                <span style={{ color: '#22d3ee' }}>{finalShootCtx.remainingAttempts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Giorni:</span>
                <span style={{ color: '#fbbf24' }}>{finalShootCtx.daysRemaining}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Bloccato:</span>
                <span style={{ color: finalShootCtx.isLocked ? '#f87171' : '#4ade80' }}>
                  {finalShootCtx.isLocked ? 'SÌ' : 'NO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Test Mode:</span>
                <span style={{ color: finalShootCtx.isTestMode ? '#fbbf24' : '#6b7280' }}>
                  {finalShootCtx.isTestMode ? 'SÌ' : 'NO'}
                </span>
              </div>
            </div>

            {/* Bottoni */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {missionInfo?.prize_lat && missionInfo?.prize_lng && (
                <Button 
                  onClick={flyToPrize}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Vai al Premio
                </Button>
              )}
              <Button 
                onClick={() => window.location.href = '/final-shoot-test?test-final-shoot=true'}
                variant="outline"
                className="flex-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                size="sm"
              >
                Test Mode
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Final Shoot Pill */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
        }}
      >
        <FinalShootPill />
      </motion.div>

      {/* Loading state */}
      {!mapLoaded && !mapError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070818',
          zIndex: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(0,209,255,0.3)',
              borderTopColor: '#00d1ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#00d1ff' }}>Caricamento mappa...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070818',
          zIndex: 10,
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.3)', 
            borderRadius: '16px',
            maxWidth: '320px',
          }}>
            <AlertTriangle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
            <p style={{ color: '#f87171', marginBottom: '8px' }}>Errore caricamento mappa</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>{mapError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '16px' }}
              variant="outline"
            >
              Ricarica
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* CSS for animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Wrapper con Provider
export default function FinalShootTest() {
  return (
    <FinalShootProvider>
      <FinalShootTestContent />
    </FinalShootProvider>
  );
}
