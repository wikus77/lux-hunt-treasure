import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Stats from "../../pages/Stats";
import Leaderboard from "../../pages/Leaderboard";

const PremiumRoutes = () => {
  return (
    <>
      {/* Premium route definitions here */}
      <Route
        path="/stats"
        element={
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Stats />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Leaderboard />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};

export default PremiumRoutes;
