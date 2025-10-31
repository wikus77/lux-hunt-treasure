
import React from 'react';
import { SafeMarker } from '@/components/map/safe/SafeMarker';

interface UserLocationMarkerProps {
  position: [number, number];
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return <SafeMarker position={position} />;
};

export default UserLocationMarker;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

