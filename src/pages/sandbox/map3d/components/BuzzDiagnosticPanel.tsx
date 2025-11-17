import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useDebugFlag } from '@/debug/useDebugFlag';

interface BuzzArea {
  id: string;
  week: number;
  radius_km: number;
  level: number;
  created_at: string;
  source: string;
  center_lat: number;
  center_lng: number;
  cost_m1u?: number;
}

const BuzzDiagnosticPanel: React.FC = () => {
  const { user } = useAuthContext();
  const isDebugEnabled = useDebugFlag();
  const [areas, setAreas] = useState<BuzzArea[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user?.id || !isDebugEnabled) return;

    const loadAreas = async () => {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('id, week, radius_km, level, created_at, source, center_lat, center_lng')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ BuzzDiagnostic: Error loading areas:', error);
        return;
      }

      console.log('🔍 BuzzDiagnostic: Loaded', data?.length || 0, 'areas');
      setAreas(data || []);
    };

    loadAreas();

    // Realtime subscription for new areas
    const channel = supabase
      .channel('buzz_diagnostic')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_map_areas',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔍 BuzzDiagnostic: New area inserted', payload);
          loadAreas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isDebugEnabled]);

  if (!isDebugEnabled) return null;

  return (
    <div className="fixed bottom-20 left-2 z-[9999] bg-black/90 border border-cyan-500/30 rounded-lg shadow-xl max-w-sm">
      <div 
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xs font-bold text-cyan-400">
          🔍 BUZZ DIAGNOSTIC ({areas.length})
        </h3>
        <span className="text-cyan-400 text-xs">
          {isCollapsed ? '▼' : '▲'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="px-3 pb-3 max-h-96 overflow-y-auto">
          <div className="space-y-2 text-xs">
            {areas.length === 0 && (
              <div className="text-gray-500 py-2">No BUZZ areas yet</div>
            )}
            {areas.map((area, idx) => (
              <div 
                key={area.id} 
                className="border-t border-cyan-500/20 pt-2 space-y-1"
              >
                <div className="flex justify-between items-start">
                  <span className="text-cyan-300 font-semibold">#{idx + 1}</span>
                  <span className="text-gray-400 text-[10px]">
                    {new Date(area.created_at).toLocaleString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                  <div>
                    <span className="text-gray-500">Week:</span>{' '}
                    <span className="text-white font-mono">{area.week}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Level:</span>{' '}
                    <span className="text-cyan-400 font-bold">{area.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Radius:</span>{' '}
                    <span className="text-yellow-400 font-mono">{area.radius_km} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost:</span>{' '}
                    <span className="text-green-400 font-mono">{area.cost_m1u || 0} M1U</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Center:</span>{' '}
                    <span className="text-gray-300 font-mono">
                      {area.center_lat.toFixed(5)}, {area.center_lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Source:</span>{' '}
                    <span className="text-purple-400">{area.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuzzDiagnosticPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
