/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Unified Auth Test Component - PWA Safari iOS
 */

import React from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const UnifiedAuthTest: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    session, 
    login, 
    logout, 
    hasRole 
  } = useUnifiedAuth();

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3>🔐 UNIFIED AUTH STATUS</h3>
      <div className="mt-2">
        <p>✅ Authenticated: {isAuthenticated ? 'YES' : 'NO'}</p>
        <p>⏳ Loading: {isLoading ? 'YES' : 'NO'}</p>
        <p>👤 User: {user?.email || 'None'}</p>
        <p>🎫 Session: {session ? 'Active' : 'None'}</p>
        <p>🔑 Developer: {hasRole('developer') ? 'YES' : 'NO'}</p>
        <p>🏠 PWA: {window.matchMedia('(display-mode: standalone)').matches ? 'YES' : 'NO'}</p>
      </div>
    </div>
  );
};