import React from 'react';
import { Route } from 'wouter';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Stats from "../../pages/Stats";
import Leaderboard from "../../pages/Leaderboard";

const PremiumRoutes = () => {
  return (
    <>
      <Route
        path="/stats"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Stats />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/leaderboard"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Leaderboard />
          </RoleBasedProtectedRoute>
        )}
      />
    </>
  );
};

export default PremiumRoutes;