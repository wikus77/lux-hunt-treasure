// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Permanent Security Check System Component

import React, { createContext, useContext, useEffect, useState } from 'react';
import { performSecurityCheck, SecurityCheckResult } from '@/utils/security-hardening';
import { securityAlert } from '@/utils/security-config';

interface SecurityCheckContextType {
  lastSecurityCheck: SecurityCheckResult | null;
  isSecurityValid: boolean;
  runSecurityCheck: () => Promise<SecurityCheckResult>;
}

const SecurityCheckContext = createContext<SecurityCheckContextType | undefined>(undefined);

interface SecurityCheckProviderProps {
  children: React.ReactNode;
}

export const SecurityCheckProvider: React.FC<SecurityCheckProviderProps> = ({ children }) => {
  const [lastSecurityCheck, setLastSecurityCheck] = useState<SecurityCheckResult | null>(null);
  const [isSecurityValid, setIsSecurityValid] = useState(true);

  const runSecurityCheck = async (): Promise<SecurityCheckResult> => {
    const result = await performSecurityCheck();
    setLastSecurityCheck(result);
    setIsSecurityValid(result.score >= 95);

    if (result.blockedDeploy) {
      securityAlert('SECURITY_CHECK_FAILED', {
        score: result.score,
        level: result.level,
        issuesCount: result.issues.length
      });
    }

    return result;
  };

  // Run security check on app start and periodically
  useEffect(() => {
    runSecurityCheck();

    // Periodic security check every 30 minutes
    const interval = setInterval(runSecurityCheck, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for critical app changes
  useEffect(() => {
    const handleCriticalChange = () => {
      console.log('🔐 Critical change detected - Running security check');
      runSecurityCheck();
    };

    // Listen for auth changes
    window.addEventListener('auth-success', handleCriticalChange);
    window.addEventListener('auth-logout', handleCriticalChange);

    return () => {
      window.removeEventListener('auth-success', handleCriticalChange);
      window.removeEventListener('auth-logout', handleCriticalChange);
    };
  }, []);

  const contextValue: SecurityCheckContextType = {
    lastSecurityCheck,
    isSecurityValid,
    runSecurityCheck
  };

  return (
    <SecurityCheckContext.Provider value={contextValue}>
      {children}
    </SecurityCheckContext.Provider>
  );
};

export const useSecurityCheck = (): SecurityCheckContextType => {
  const context = useContext(SecurityCheckContext);
  if (!context) {
    throw new Error('useSecurityCheck must be used within a SecurityCheckProvider');
  }
  return context;
};

export default SecurityCheckProvider;