
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";
import EmailCampaign from "../pages/EmailCampaign";

/**
 * Admin only routes
 * Available to users with 'admin' or 'developer' role
 */
export const adminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <RoleBasedProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleBasedProtectedRoute>
      }
    />
    
    {/* Email Campaign route - accessible to admin and developer roles */}
    <Route
      path="/email-campaign"
      element={
        <RoleBasedProtectedRoute allowedRoles={['admin', 'developer']}>
          <EmailCampaign />
        </RoleBasedProtectedRoute>
      }
    />
  </>
);
