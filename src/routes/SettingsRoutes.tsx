
import { Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import Settings from "../pages/Settings";
import PersonalInfo from "../pages/PersonalInfo";
import PrivacySecurity from "../pages/PrivacySecurity";
import LanguageSettings from "../pages/LanguageSettings";
import Notifications from "../pages/Notifications";

export const SettingsRoutes = () => {
  return (
    <>
      {/* Standard User Settings Routes */}
      <Route
        path="/settings"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Settings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/personal-info"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PersonalInfo />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/privacy-security"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PrivacySecurity />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/language-settings"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <LanguageSettings />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Notifications />
          </RoleBasedProtectedRoute>
        }
      />
    </>
  );
};
