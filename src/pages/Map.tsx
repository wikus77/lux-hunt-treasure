
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';
import MapPage from './MapPage';

const Map = () => {
  console.log('M1MAP-STRUCT', 'Route /map rendering MapPage');
  
  // Global duplicate mount guard
  if ((window as any).__M1_MAP_MOUNTED__) {
    console.warn('DUP_MAP_MOUNT: Map already mounted, preventing duplicate');
    return <div className="page-map">Mappa già caricata...</div>;
  }
  (window as any).__M1_MAP_MOUNTED__ = true;

  // Add page-map class for CSS targeting
  React.useEffect(() => {
    document.body.classList.add('page-map');
    return () => {
      document.body.classList.remove('page-map');
      try { delete (window as any).__M1_MAP_MOUNTED__; } catch {}
    };
  }, []);

  return <MapPage />;
};

export default Map;
