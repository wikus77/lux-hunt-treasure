
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import Home from "../pages/Home";
import Events from "../pages/Events";
import Profile from "../pages/Profile";
import Map from "../pages/Map";
import Buzz from "../pages/Buzz";

/**
 * Base user routes that require basic authentication
 * Available to users with 'user', 'moderator', or 'admin' roles
 */
export const userRoutes = (
  <>
    <Route
      path="/home"
      element={
        <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
          <Home />
        </RoleBasedProtectedRoute>
      }
    />
    <Route
      path="/events"
      element={
        <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
          <Events />
        </RoleBasedProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
          <Profile />
        </RoleBasedProtectedRoute>
      }
    />
    <Route
      path="/map"
      element={
        <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
          <Map />
        </RoleBasedProtectedRoute>
      }
    />
    <Route
      path="/buzz"
      element={
        <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
          <Buzz />
        </RoleBasedProtectedRoute>
      }
    />
  </>
);
