// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
import React from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import MapPageHeader from './MapPageHeader';

interface MapPageLayoutProps {
  children: React.ReactNode;
}

const MapPageLayout: React.FC<MapPageLayoutProps> = ({ children }) => {
  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: "rgba(19, 21, 33, 0.55)",
          backdropFilter: "blur(12px)"
        }}
      >
        <MapPageHeader />
      </header>
      
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 0px) + 60px)', // © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px) + 40px)', // © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4 pt-4 pb-2 max-w-6xl">
          {/* © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ */}
          {/* ✅ Compatibile Capacitor iOS */}
          
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default MapPageLayout;