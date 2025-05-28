
import { Route } from 'react-router-dom';
import Admin from '@/pages/Admin'; // Ensure correct import path
import RoleBasedProtectedRoute from '@/components/auth/RoleBasedProtectedRoute';
import { useState, useEffect } from 'react';
import AdminPrizeClues from '@/pages/AdminPrizeClues';
import AdminPrizes from '@/pages/AdminPrizes';
import AbuseLogsPage from '@/pages/AbuseLogsPage';

export default function AdminRoutes() {
  const [bypassProtection, setBypassProtection] = useState(false);
  
  useEffect(() => {
    // Check if current date is before May 21, 2025
    const expirationDate = new Date('2025-05-21T00:00:00');
    const currentDate = new Date();
    
    setBypassProtection(currentDate < expirationDate);
    
    // Debug log for routes
    console.log("🟢 AdminRoutes rendering, bypassProtection:", currentDate < expirationDate);
    console.log("🟢 Current routes being configured in AdminRoutes");
  }, []);

  return (
    <>
      <Route 
        path="/admin" 
        element={
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
      
      {/* Direct access to Prize Clues Manager without protection */}
      <Route 
        path="/admin/prizes" 
        element={<AdminPrizes />} 
      />
      
      {/* Keep the original AdminPrizeClues route for now */}
      <Route 
        path="/admin/prize-clues" 
        element={<AdminPrizeClues />} 
      />

      {/* Abuse Logs Registry - Admin only */}
      <Route 
        path="/admin/abuse-logs" 
        element={
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
