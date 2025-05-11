
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import Stats from "../pages/Stats";
import Leaderboard from "../pages/Leaderboard";

export const PremiumRoutes = () => {
  return (
    <>
      {/* Premium Features - Require paid subscription or admin role */}
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
