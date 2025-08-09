
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
      {qrMarkers.map((marker) => (
        <div
          key={marker.id}
          style={{
            position: 'absolute',
            left: `${marker.lng}%`,
            top: `${marker.lat}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            ...getQRMarkerStyle(marker)
          }}
          onClick={() => handleQRClick(marker.code, marker.isInRange)}
          title={`QR: ${marker.location_name} (${marker.distance}m)`}
        >
          
        </div>
      ))}
    </>
  );
};