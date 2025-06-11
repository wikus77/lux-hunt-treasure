
import React from 'react';
import { BuzzMapArea } from '@/hooks/useBuzzMapLogic';
import BuzzAreaRenderer from '@/components/map/BuzzAreaRenderer';

interface BuzzCircleRendererProps {
  areas: BuzzMapArea[];
}

const BuzzCircleRenderer: React.FC<BuzzCircleRendererProps> = ({ areas }) => {
  console.debug("🔍 RENDER CHECK: Areas present in component:", {
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

  return <BuzzAreaRenderer areas={areas} />;
};

export default BuzzCircleRenderer;
