// © 2025 Joseph MULÉ – M1SSION™ – EMERGENCY ADMIN INSTANT ACCESS
// COMPONENTE DI EMERGENZA PER BYPASS IMMEDIATO ADMIN

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const AdminInstantAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getCurrentUser } = useUnifiedAuth();
  const [, setLocation] = useLocation();
  
  const user = getCurrentUser();
  
  // 🚀 INSTANT ADMIN BYPASS - ZERO DELAY
  useEffect(() => {
    if (user?.email === 'wikus77@hotmail.it') {
      console.log('🚀 ADMIN INSTANT ACCESS - Emergency redirect to /home');
      setLocation('/home');
    }
  }, [user?.email, setLocation]);
  
  // 🚀 EMERGENCY ADMIN CHECK - BEFORE RENDER
  if (user?.email === 'wikus77@hotmail.it') {
    console.log('🚀 EMERGENCY ADMIN DETECTED - Instant access granted');
    return <>{children}</>;
  }
  
  return <>{children}</>;
};

export default AdminInstantAccess;