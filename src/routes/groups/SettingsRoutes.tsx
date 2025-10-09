import React from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import PersonalInfo from "../../pages/PersonalInfo";
import PrivacySecurity from "../../pages/PrivacySecurity";
import LanguageSettings from "../../pages/LanguageSettings";
import Notifications from "../../pages/Notifications";
import SettingsPage from "../../pages/settings/SettingsPage";
import AgentProfileSettings from "../../pages/settings/AgentProfileSettings";
import SecuritySettings from "../../pages/settings/SecuritySettings";
import MissionSettings from "../../pages/settings/MissionSettings";
import NotificationsSettings from "../../pages/settings/NotificationsSettings";
import PrivacySettings from "../../pages/settings/PrivacySettings";
import LegalSettings from "../../pages/settings/LegalSettings";
import AppInfoSettings from "../../pages/settings/AppInfoSettings";

const SettingsRoutes = () => {
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
  return (
    <>
      <Route
        path="/settings"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <SettingsPage />
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
      <Route
        path="/settings/profile"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <AgentProfileSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/security"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <SecuritySettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/mission"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <MissionSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <NotificationsSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/privacy"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PrivacySettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/legal"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <LegalSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/settings/info"
        element={
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <AppInfoSettings />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};

export default SettingsRoutes;
