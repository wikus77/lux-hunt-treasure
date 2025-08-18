
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';
import MapPage from './MapPage';

const Map = () => {
  console.log('🗺️ M1MAP-ROUTE: Rendering MapPage for /map route');
  
  // Add page-map class for CSS targeting
  React.useEffect(() => {
    document.body.classList.add('page-map');
    return () => {
      document.body.classList.remove('page-map');
    };
  }, []);

  return <MapPage />;
};

export default Map;
