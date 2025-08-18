import { Route } from 'wouter';
import Admin from '@/pages/Admin'; // Ensure correct import path
import RoleBasedProtectedRoute from '@/components/auth/RoleBasedProtectedRoute';
import { useState, useEffect } from 'react';
import AdminPrizeClues from '@/pages/AdminPrizeClues';
import AdminPrizes from '@/pages/AdminPrizes';
import AbuseLogsPage from '@/pages/AbuseLogsPage';

export default function AdminRoutes() {
  const [bypassProtection, setBypassProtection] = useState(false);

  useEffect(() => {
    // Temporary bypass for admin protection until May 21, 2025
    const currentDate = new Date();
    const expirationDate = new Date('2025-05-21');
    
    if (currentDate < expirationDate) {
      setBypassProtection(true);
    }

    // Debug log for routes
    console.log("🟢 AdminRoutes rendering, bypassProtection:", currentDate < expirationDate);
    console.log("🟢 Current routes being configured in AdminRoutes");
  }, []);

  return (
    <>
      <Route 
        path="/admin" 
        component={() =>
          bypassProtection ? (
            // Temporary direct access until May 21, 2025
            <Admin />
          ) : (
            // After May 21, 2025, return to role-based protection
            <RoleBasedProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </RoleBasedProtectedRoute>
          )
        }
      />

      <Route 
        path="/admin/prizes" 
        component={() =>
          bypassProtection ? (
            <AdminPrizes />
          ) : (
            <RoleBasedProtectedRoute allowedRoles={['admin']}>
              <AdminPrizes />
            </RoleBasedProtectedRoute>
          )
        }
      />

      <Route 
        path="/admin/prize-clues" 
        component={() =>
          bypassProtection ? (
            <AdminPrizeClues />
          ) : (
            <RoleBasedProtectedRoute allowedRoles={['admin']}>
              <AdminPrizeClues />
            </RoleBasedProtectedRoute>
          )
        }
      />

      <Route 
        path="/admin/abuse-logs" 
        component={() =>
          bypassProtection ? (
            <AbuseLogsPage />
          ) : (
            <RoleBasedProtectedRoute allowedRoles={['admin']}>
              <AbuseLogsPage />
            </RoleBasedProtectedRoute>
          )
        }
      />
    </>
  );
}