
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Settings from "../../pages/Settings";
import PrivacySecurity from "../../pages/PrivacySecurity";
import PersonalInfo from "../../pages/PersonalInfo";
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
        path="/settings/privacy"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PrivacySecurity />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/personal"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PersonalInfo />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/language"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <LanguageSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications"
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
