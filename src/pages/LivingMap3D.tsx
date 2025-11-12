/**
 * Living Map 3D - Route Alias
 * Re-exports the MapTiler 3D component for alternative route access
 */
import React from 'react';

const MapTiler3D = React.lazy(() => import('@/pages/sandbox/MapTiler3D'));

const LivingMap3D: React.FC = () => {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#070818]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[rgba(0,209,255,0.3)] border-t-[rgba(0,209,255,1)] mb-4"></div>
          <p className="text-[rgba(0,209,255,0.9)] text-lg">Loading 3D Map...</p>
        </div>
      </div>
    }>
      <MapTiler3D />
    </React.Suspense>
  );
};

export default LivingMap3D;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
