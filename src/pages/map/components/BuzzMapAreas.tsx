
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import BuzzCircleRenderer from './BuzzCircleRenderer';
import { getCurrentColor, getCurrentColorName, getBuzzGlowStyles } from './BuzzColorManager';

interface BuzzMapAreasProps {
  areas: BuzzMapArea[];
}

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas }) => {
  const currentColor = getCurrentColor();
  const currentColorName = getCurrentColorName();
  
  console.log('🗺️ BuzzMapAreas - Rendering areas:', {
    areasCount: areas.length,
    areas: areas.map(area => ({
      id: area.id,
      lat: area.lat,
      lng: area.lng,
      radius_km: area.radius_km,
      isActive: area.isActive
    })),
    currentColor: currentColor,
    currentColorName: currentColorName,
    timestamp: new Date().toISOString()
  });

  // CRITICAL: Force re-render when areas change
  React.useEffect(() => {
    console.log('🔄 BuzzMapAreas - Areas updated, forcing re-render:', areas.length);
  }, [areas]);

  if (areas.length === 0) {
    console.log('⚠️ BuzzMapAreas - No areas to display');
    return null;
  }

  // CRITICAL: Show only the LATEST area (most recent by creation date)
  const latestArea = areas.reduce((latest, current) => {
    const latestTime = new Date(latest.created_at).getTime();
    const currentTime = new Date(current.created_at).getTime();
    return currentTime > latestTime ? current : latest;
  });

  console.log('🎯 BuzzMapAreas - Showing ONLY latest area:', {
    id: latestArea.id,
    lat: latestArea.lat,
    lng: latestArea.lng,
    radius_km: latestArea.radius_km,
    created_at: latestArea.created_at
  });

  return (
    <>
      {/* CRITICAL: Only render the latest area */}
      <BuzzCircleRenderer areas={[latestArea]} />
      
      {/* Glow styles */}
      <style>
        {getBuzzGlowStyles(currentColor)}
      </style>
    </>
  );
};

export default BuzzMapAreas;
