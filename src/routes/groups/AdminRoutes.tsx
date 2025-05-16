
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import AdminDashboard from "../../pages/AdminDashboard";
import Admin from "../../pages/Admin";
import EmailCampaign from "../../pages/EmailCampaign";

const AdminRoutes = () => {
  return (
    <>
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </RoleBasedProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedProtectedRoute>
        }
      />

      {/* Email Campaign route */}
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
};

export default AdminRoutes;
