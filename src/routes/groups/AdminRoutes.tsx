
import React from 'react';
import { Route } from 'react-router-dom';
import Admin from '../../pages/Admin';
import RoleBasedProtectedRoute from '@/components/auth/RoleBasedProtectedRoute';
import { useState, useEffect } from 'react';

export const AdminRoutes = () => {
  const [bypassProtection, setBypassProtection] = useState(false);
  
  useEffect(() => {
    // Check if current date is before May 21, 2025
    const expirationDate = new Date('2025-05-21T00:00:00');
    const currentDate = new Date();
    
    console.log('AdminRoutes: Checking bypass protection', {
      currentDate: currentDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      shouldBypass: currentDate < expirationDate
    });
    
    setBypassProtection(currentDate < expirationDate);
  }, []);

  console.log('AdminRoutes rendering, bypassProtection:', bypassProtection);

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
    </>
  );
};
