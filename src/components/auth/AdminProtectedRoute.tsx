// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AdminProtectedRoute - Routes only accessible to admin users
// Uses centralized admin config for email-based verification

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { isAdminEmail } from '@/config/adminConfig';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * AdminProtectedRoute
 * 
 * Protects routes that should only be accessible to admin users.
 * Uses the centralized admin email list from adminConfig.ts
 * 
 * Behavior:
 * - If user is not authenticated: redirects to /login
 * - If user is authenticated but NOT admin: shows "Accesso Non Autorizzato"
 * - If user is admin: renders children
 */
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/home' 
}) => {
  const { isAuthenticated, isLoading, getCurrentUser } = useUnifiedAuth();
  const [, setLocation] = useLocation();
  
  // Get current user
  const user = getCurrentUser();
  const userEmail = user?.email;
  
  // Check if user is admin using centralized config
  const isAdmin = isAdminEmail(userEmail);
  
  // Debug only in development + Redirect logic
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🛡️ [AdminProtectedRoute] Check:', { 
        isAuthenticated, 
        isLoading, 
        isAdmin,
        email: userEmail ? `${userEmail.slice(0, 3)}***` : 'none'
      });
    }
    
    // Redirect to login if not authenticated (after loading completes)
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, isAdmin, userEmail, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-sm">Verifica accesso admin...</div>
      </div>
    );
  }

  // Not authenticated - show minimal loading while redirect happens
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-sm">Reindirizzamento...</div>
      </div>
    );
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <h1 className="text-xl font-bold">Accesso Non Autorizzato</h1>
          <p className="text-gray-400 text-sm max-w-md">
            Questa sezione è riservata agli amministratori di M1SSION™.
          </p>
          <button
            onClick={() => setLocation(fallbackPath)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // Admin user - render children
  return <>{children}</>;
};

export default AdminProtectedRoute;

