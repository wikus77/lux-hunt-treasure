
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import AdminDashboard from "../pages/AdminDashboard";

export const AdminRoutes = () => {
  return (
    <>
      {/* Admin Dashboard - Only for admin users */}
      <Route
        path="/admin"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};
