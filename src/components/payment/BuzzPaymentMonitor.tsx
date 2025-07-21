// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ Payment Monitor Component - Handles auto-redirect after successful payments

import { useBuzzPaymentRedirect } from "@/hooks/useBuzzPaymentRedirect";

export const BuzzPaymentMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This hook monitors for successful BUZZ payments and auto-redirects to map
  useBuzzPaymentRedirect();
  
  return <>{children}</>;
};