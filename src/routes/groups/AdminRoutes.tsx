
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from '@/pages/Admin';
import AdminPrizeClues from '@/pages/AdminPrizeClues';
import RoleBasedProtectedRoute from '@/components/auth/RoleBasedProtectedRoute';

// This component is now used as a sub-router within AppRoutes
const AdminRoutes = () => {
  const [bypassProtection, setBypassProtection] = useState(false);
  
  useEffect(() => {
    // Check if current date is before May 21, 2025
    const expirationDate = new Date('2025-05-21T00:00:00');
    const currentDate = new Date();
    
    setBypassProtection(currentDate < expirationDate);
  }, []);

  return (
    <Routes>
      <Route 
        path="/" 
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
      <Route
        path="/prize-clues"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <AdminPrizeClues />
          </RoleBasedProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
