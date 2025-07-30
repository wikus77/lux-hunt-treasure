// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import CinematicLandingPage from '@/components/cinematic/CinematicLandingPage';

const CinematicHomePage: React.FC = () => {
  console.log('🎬 CINEMATIC HOME: Page component mounted');
  console.log('🚨 ATTENZIONE: Landing page cinematografica caricata correttamente!');
  
  return (
    <>
      <div className="fixed top-0 left-0 z-[999] bg-red-500 text-white p-2 text-sm">
        🎬 CINEMATIC LANDING ATTIVA
      </div>
      <CinematicLandingPage />
    </>
  );
};

export default CinematicHomePage;