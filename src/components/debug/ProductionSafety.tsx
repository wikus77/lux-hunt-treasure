// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Production Safety Component

import { useEffect } from 'react';
import { safeLog, isProductionReady } from '@/utils/buildOptimization';

interface ProductionSafetyProps {
  children: React.ReactNode;
}

/**
 * Production Safety Wrapper
 * Ensures app behavior is optimized for production builds
 */
export const ProductionSafety: React.FC<ProductionSafetyProps> = ({ children }) => {
  useEffect(() => {
    const isReady = isProductionReady();
    
    if (!isReady) {
      console.warn('⚠️ Production readiness check failed');
    } else {
      safeLog('✅ M1SSION™ Production Ready - By Joseph Mulè / NIYVORA KFT™');
    }
  }, []);

  return <>{children}</>;
};

export default ProductionSafety;