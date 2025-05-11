
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";

/**
 * Admin only routes
 * Available only to users with 'admin' role
 */
export const adminRoutes = (
  <Route
    path="/admin"
    element={
      <RoleBasedProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </RoleBasedProtectedRoute>
    }
  />
);
