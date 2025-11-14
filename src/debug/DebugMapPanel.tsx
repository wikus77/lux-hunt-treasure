/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * MAP Debug Panel - Read-Only Diagnostics
 */

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzMapPricingNew } from '@/hooks/useBuzzMapPricingNew';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';
import { CopyJsonButton } from './CopyJsonButton';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const DebugMapPanel: React.FC = () => {
  const { user, session, isAuthenticated } = useUnifiedAuth();
  const { nextLevel, nextRadiusKm, nextCostM1U } = useBuzzMapPricingNew(user?.id);
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const [collapsed, setCollapsed] = useState(true);
  const [geoPermission, setGeoPermission] = useState<string>('unknown');
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    // Check geolocation permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setGeoPermission(result.state);
      });
    }

    // Get current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('M1DEBUG: Geolocation error:', error);
        }
      );
    }
  }, []);

  const getJwtInfo = () => {
    if (!session?.access_token) return { len: 0, exp: null };
    try {
      const parts = session.access_token.split('.');
      if (parts.length !== 3) return { len: 0, exp: null };
      const payload = JSON.parse(atob(parts[1]));
      return {
        len: session.access_token.length,
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
      };
    } catch (e) {
      return { len: session.access_token.length, exp: null };
    }
  };

  const testMapGeneration = async () => {
    try {
      console.log('M1DEBUG: Testing MAP generation...');
      
      const coords = currentPos || { lat: 41.9028, lng: 12.4964 }; // Rome fallback

      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          generateMap: true,
          coordinates: coords,
          sessionId: 'debug_' + Date.now()
        },
        headers: { 'x-m1-debug': '1' }
      });

      const result = {
        timestamp: new Date().toISOString(),
        success: !error,
        data,
        error: error?.message || null,
        coordinates: coords
      };

      setLastResult(result);
      console.log('M1DEBUG: MAP test result:', result);
    } catch (e: any) {
      console.error('M1DEBUG: MAP test failed:', e);
      setLastResult({ error: e.message });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        padding: collapsed ? '8px' : '12px',
        borderRadius: '8px',
        fontSize: '11px',
        zIndex: 9999,
        maxWidth: '320px',
        maxHeight: collapsed ? '40px' : '60vh',
        overflow: 'auto',
        fontFamily: 'monospace',
        border: '1px solid #10b981'
      }}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginBottom: collapsed ? 0 : '8px'
        }}
      >
        <span>🗺️ MAP DEBUG</span>
        {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {!collapsed && (
        <>
          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Auth & Session</div>
            <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
            <div>User ID: {user?.id?.substring(0, 12)}...</div>
            <div>JWT Len: {getJwtInfo().len}</div>
          </div>

          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Geolocation</div>
            <div>Permission: {geoPermission}</div>
            {currentPos && (
              <>
                <div>Lat: {currentPos.lat.toFixed(4)}</div>
                <div>Lng: {currentPos.lng.toFixed(4)}</div>
              </>
            )}
            {!currentPos && <div style={{ color: '#ef4444' }}>No position</div>}
          </div>

          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Economy</div>
            <div>Balance M1U: {unitsData?.balance || 0}</div>
            <div>Cost M1U: {nextCostM1U}</div>
            <div>Next Level: {nextLevel}</div>
            <div>Next Radius: {nextRadiusKm}km</div>
          </div>

          <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Payload Preview</div>
            <pre style={{ fontSize: '9px', margin: 0 }}>
              {JSON.stringify({
                generateMap: true,
                coordinates: currentPos || { lat: 'N/A', lng: 'N/A' },
                sessionId: 'xxx'
              }, null, 1)}
            </pre>
          </div>

          {lastResult && (
            <div style={{ marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Last Test</div>
              <div>Success: {lastResult.success ? '✅' : '❌'}</div>
              {lastResult.data?.area_id && (
                <>
                  <div>Area ID: {lastResult.data.area_id.substring(0, 12)}...</div>
                  <div>Radius: {lastResult.data.radius_km}km</div>
                  <div>Level: {lastResult.data.level}</div>
                </>
              )}
              {lastResult.error && <div style={{ color: '#ef4444' }}>Error: {lastResult.error}</div>}
              <CopyJsonButton data={lastResult} label="Copy Result" />
            </div>
          )}

          <div style={{ display: 'flex', gap: '4px', paddingTop: '8px', borderTop: '1px solid #444' }}>
            <button
              onClick={testMapGeneration}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test MAP
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
