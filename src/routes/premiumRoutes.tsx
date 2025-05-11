
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Premium pages
import Stats from "../pages/Stats";
import Leaderboard from "../pages/Leaderboard";

/**
 * Premium features routes
 * Available to premium users or admin
 */
export const premiumRoutes = (
  <>
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
