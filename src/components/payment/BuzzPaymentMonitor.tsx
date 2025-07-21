// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { useBuzzPaymentRedirect } from '@/hooks/useBuzzPaymentRedirect';

const BuzzPaymentMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useBuzzPaymentRedirect();
  return <>{children}</>;
};

export default BuzzPaymentMonitor;