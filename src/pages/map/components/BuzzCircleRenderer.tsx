
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import BuzzAreaRenderer from '@/components/map/BuzzAreaRenderer';

interface BuzzCircleRendererProps {
  areas: BuzzMapArea[];
}

const BuzzCircleRenderer: React.FC<BuzzCircleRendererProps> = ({ areas }) => {
  // FIX 1 & 4 - Enhanced debugging for area rendering
  React.useEffect(() => {
    console.log("🔥 FIX 1 & 4 – BUZZ CIRCLE RENDERER UPDATE:", {
      areas_count: areas.length,
      areas_detail: areas.map(a => ({ 
        id: a.id, 
        user_id: a.user_id, 
        radius_km: a.radius_km, 
        radius_meters: a.radius_km * 1000,
        lat: a.lat, 
        lng: a.lng 
      }))
    });
    
    if (areas.length === 0) {
      console.log("❌ FIX 1 WARNING - No areas to render");
    } else {
      console.log(`✅ FIX 1 SUCCESS - Rendering ${areas.length} areas`);
    }
  }, [areas]);

  return <BuzzAreaRenderer areas={areas} />;
};

export default BuzzCircleRenderer;
