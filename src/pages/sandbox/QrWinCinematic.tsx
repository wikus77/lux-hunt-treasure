// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

/**
 * QrWinCinematic - Oscar-level Victory Experience
 * FIXED: Clean, no errors
 */

import React from 'react';
import CinematicVictory from '@/components/qrwin/CinematicVictory';

const QrWinCinematic: React.FC = () => {
  const handleComplete = () => {
    window.location.href = 'https://www.m1ssion.eu/landing';
  };

  return <CinematicVictory onComplete={handleComplete} />;
};

export default QrWinCinematic;
