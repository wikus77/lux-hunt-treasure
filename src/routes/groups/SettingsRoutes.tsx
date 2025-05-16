
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Settings from "../../pages/Settings";
import PersonalInfo from "../../pages/PersonalInfo";
import PrivacySecurity from "../../pages/PrivacySecurity";
import LanguageSettings from "../../pages/LanguageSettings";
import Notifications from "../../pages/Notifications";

const SettingsRoutes = () => {
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
  return (
    <>
      <Route
        path="/settings"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Settings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/personal-info"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PersonalInfo />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/privacy-security"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PrivacySecurity />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/language-settings"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <LanguageSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Notifications />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};

export default SettingsRoutes;
