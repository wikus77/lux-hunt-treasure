// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useEffect, useState } from 'react';

export const MapDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    timestamp: new Date().toISOString(),
    windowSize: { width: 0, height: 0 },
    mapContainer: null as any,
    leafletContainer: null as any,
    markersCount: 0,
    buzzAreasCount: 0
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const mapWrapper = document.querySelector('.map-container-wrapper');
      const leafletContainer = document.querySelector('.leaflet-container');
      const markers = document.querySelectorAll('.leaflet-marker-icon');
      const buzzAreas = document.querySelectorAll('.buzz-area-glow');

      setDebugInfo({
        timestamp: new Date().toISOString(),
        windowSize: { width: window.innerWidth, height: window.innerHeight },
        mapContainer: mapWrapper ? {
          exists: true,
          style: mapWrapper.getAttribute('style'),
          clientRect: mapWrapper.getBoundingClientRect()
        } : null,
        leafletContainer: leafletContainer ? {
          exists: true,
          style: leafletContainer.getAttribute('style'),
          clientRect: leafletContainer.getBoundingClientRect()
        } : null,
        markersCount: markers.length,
        buzzAreasCount: buzzAreas.length
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '100px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '10px',
        zIndex: 9999,
        maxWidth: '200px'
      }}
    >
      <div><strong>MAP DEBUG INFO</strong></div>
      <div>Time: {debugInfo.timestamp.split('T')[1].split('.')[0]}</div>
      <div>Window: {debugInfo.windowSize.width}x{debugInfo.windowSize.height}</div>
      <div>Map Container: {debugInfo.mapContainer ? '✅' : '❌'}</div>
      <div>Leaflet Container: {debugInfo.leafletContainer ? '✅' : '❌'}</div>
      <div>Markers: {debugInfo.markersCount}</div>
      <div>BUZZ Areas: {debugInfo.buzzAreasCount}</div>
      {debugInfo.mapContainer && (
        <div>Map Rect: {Math.round(debugInfo.mapContainer.clientRect?.width || 0)}x{Math.round(debugInfo.mapContainer.clientRect?.height || 0)}</div>
      )}
    </div>
  );
};

export default MapDebugInfo;