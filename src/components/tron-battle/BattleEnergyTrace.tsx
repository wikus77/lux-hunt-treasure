/**
 * TRON BATTLE - Energy Trace Map Overlay
 * Phase 1.1: Display 24h winner energy trails on map
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */
// @ts-nocheck


import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface EnergyTrace {
  id: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  intensity: number;
  expires_at: string;
}

interface BattleEnergyTraceProps {
  mapRef?: any; // Pass MapLibre/Leaflet map instance
}

export function BattleEnergyTrace({ mapRef }: BattleEnergyTraceProps) {
  const [traces, setTraces] = useState<EnergyTrace[]>([]);

  useEffect(() => {
    loadTraces();

    // Subscribe to new traces
    const channel = supabase
      .channel('energy_traces')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'battle_energy_traces',
      }, () => {
        loadTraces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTraces = async () => {
    const { data } = await supabase
      .from('battle_energy_traces')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    setTraces(data || []);
  };

  useEffect(() => {
    if (!mapRef || !traces.length) return;

    // Add polylines to map
    traces.forEach((trace) => {
      const coords = [
        [trace.start_lng, trace.start_lat],
        [trace.end_lng, trace.end_lat],
      ];

      // For MapLibre GL
      if (mapRef.addLayer) {
        const sourceId = `trace-${trace.id}`;
        
        if (!mapRef.getSource(sourceId)) {
          mapRef.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
              properties: {},
            },
          });

          mapRef.addLayer({
            id: `trace-layer-${trace.id}`,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#00ffff',
              'line-width': 4,
              'line-opacity': trace.intensity * 0.8,
              'line-blur': 2,
            },
          });
        }
      }
    });
  }, [mapRef, traces]);

  // Standalone visualization (when map not available)
  if (!mapRef) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900/90 border border-cyan-500/30 rounded-lg p-4 max-w-xs">
        <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
          ⚡ Active Energy Traces
        </h3>
        <div className="space-y-2">
          {traces.length === 0 ? (
            <p className="text-gray-400 text-sm">No active traces</p>
          ) : (
            traces.map((trace) => (
              <motion.div
                key={trace.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  style={{ opacity: trace.intensity }}
                />
                <span className="text-white">
                  Battle Winner Trail
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
