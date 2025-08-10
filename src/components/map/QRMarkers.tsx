// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { useQRMapIntegration } from '@/hooks/useQRMapIntegration';

export const QRMarkers = () => {
  const { qrMarkers, getQRMarkerStyle, getQRMarkerIcon, redeemQRCode } = useQRMapIntegration();

  const handleQRClick = async (code: string, isInRange: boolean) => {
    if (!isInRange) {
      alert('🚫 Devi essere più vicino al QR code per riscattarlo!');
      return;
    }

    try {
      const result = await redeemQRCode(code);
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert('❌ Errore nel riscatto del QR code');
    }
  };

  return (
    <>
      {qrMarkers.map((marker) => {
        const top = typeof (marker as any)?.lat === 'number' ? (marker as any).lat : 0;
        const left = typeof (marker as any)?.lng === 'number' ? (marker as any).lng : 0;
        const inRange = Boolean((marker as any)?.isInRange);
        return (
          <div
            key={marker.id}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              ...getQRMarkerStyle(marker)
            }}
            onClick={() => handleQRClick(marker.code, inRange)}
            title={`QR: ${marker.location_name} (${marker.distance}m)`}
          >
            
          </div>
        );
      })}
    </>
  );
};