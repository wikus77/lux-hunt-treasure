
import React from 'react';
import BuzzCircleRenderer from './BuzzCircleRenderer';
import { getCurrentColor, getCurrentColorName, getBuzzGlowStyles } from './BuzzColorManager';

export interface BuzzMapAreasProps {
  areas: {
    id: string;
    lat: number;
    lng: number;
    radius_km: number;
    created_at: string;
    isActive: boolean;
  }[];
  selectedWeek: number;
}

// Transform raw area data to BuzzMapArea format for rendering
const transformAreaData = (area: BuzzMapAreasProps['areas'][0]) => ({
  id: area.id,
  lat: area.lat,
  lng: area.lng,
  radius_km: area.radius_km,
  coordinates: { lat: area.lat, lng: area.lng },
  radius: area.radius_km * 1000, // Convert km to meters
  color: getCurrentColor(),
  colorName: getCurrentColorName(),
  week: 1,
  generation: 1,
  isActive: area.isActive,
  user_id: '',
  created_at: area.created_at
});

const BuzzMapAreas: React.FC<BuzzMapAreasProps> = ({ areas, selectedWeek }) => {
  const currentColor = getCurrentColor();
  const currentColorName = getCurrentColorName();
  
  console.log('🗺️ BuzzMapAreas - Rendering areas:', {
    areasCount: areas.length,
    selectedWeek,
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

  // Transform the latest area to the correct format
  const transformedArea = transformAreaData(latestArea);

  return (
    <>
      {/* CRITICAL: Only render the latest area with correct data structure */}
      <BuzzCircleRenderer areas={[transformedArea]} />
      
      {/* Glow styles */}
      <style>
        {getBuzzGlowStyles(currentColor)}
      </style>
    </>
  );
};

export default BuzzMapAreas;
