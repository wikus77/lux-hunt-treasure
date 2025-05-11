
import { Routes } from "react-router-dom";

// Route Groups
import { PublicRoutes } from "./PublicRoutes";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { SettingsRoutes } from "./SettingsRoutes";
import { PremiumRoutes } from "./PremiumRoutes";
import { PaymentRoutes } from "./PaymentRoutes";
import { NotFoundRoute } from "./NotFoundRoute";

/**
 * Main routing component that combines all route groups
 */
const AppRoutes = () => {
  return (
    <Routes>
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
