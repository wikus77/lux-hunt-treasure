import React from 'react';
import { Route } from 'wouter';
import { RoleBasedProtectedRoute } from "../../components/auth/RoleBasedProtectedRoute";

// Pages
import Settings from "../../pages/Settings";
import PersonalInfo from "../../pages/PersonalInfo";
import PrivacySecurity from "../../pages/PrivacySecurity";
import LanguageSettings from "../../pages/LanguageSettings";
import Notifications from "../../pages/Notifications";
import SettingsPage from "../../pages/settings/SettingsPage";
import PersonalInfoPage from "../../pages/profile/PersonalInfoPage";
import SecurityPage from "../../pages/profile/SecurityPage";
import MissionSelection from "../../pages/MissionSelection";
// import SettingsLegal from "../../pages/SettingsLegal";
// import InfoPage from "../../pages/InfoPage";

const SettingsRoutes = () => {
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
  return (
    <>
      <Route
        path="/settings"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <SettingsPage />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/personal-info"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PersonalInfo />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/privacy-security"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PrivacySecurity />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/language-settings"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <LanguageSettings />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/notifications"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Notifications />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/profile"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PersonalInfoPage />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/security"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <SecurityPage />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/mission"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <MissionSelection />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/notifications"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <Notifications />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/privacy"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <PrivacySecurity />
          </RoleBasedProtectedRoute>
        )}
      />
      {/* Temporarily disabled until pages are created
      <Route
        path="/settings/legal"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <SettingsLegal />
          </RoleBasedProtectedRoute>
        )}
      />
      <Route
        path="/settings/info"
        component={() => (
          <RoleBasedProtectedRoute allowedRoles={baseUserRoles}>
            <InfoPage />
          </RoleBasedProtectedRoute>
        )}
      />
      */}
    </>
  );
};

export default SettingsRoutes;