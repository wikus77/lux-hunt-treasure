
import { Routes, Route } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Route Groups
import { PublicRoutes } from "./PublicRoutes";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { SettingsRoutes } from "./SettingsRoutes";
import { PremiumRoutes } from "./PremiumRoutes";
import { PaymentRoutes } from "./PaymentRoutes";
import { NotFoundRoute } from "./NotFoundRoute";

// Import the EmailCampaign page for direct routing
import EmailCampaign from "../pages/EmailCampaign";

/**
 * Main routing component that combines all route groups
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Special direct route for email campaign to bypass CAPTCHA */}
      <Route
        path="/email-campaign"
        element={
          <RoleBasedProtectedRoute 
            allowedRoles={['admin', 'developer']} 
            requireEmailVerification={false}
          >
            <EmailCampaign />
          </RoleBasedProtectedRoute>
        }
      />

      <PublicRoutes />
      <UserRoutes />
      <AdminRoutes />
      <SettingsRoutes />
      <PremiumRoutes />
      <PaymentRoutes />
      <NotFoundRoute />
    </Routes>
  );
};

export default AppRoutes;
