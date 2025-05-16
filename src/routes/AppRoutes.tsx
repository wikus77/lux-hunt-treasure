
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Admin from "../pages/Admin"; // Importazione diretta per debug

// Route Groups
import PublicRoutes from "./groups/PublicRoutes";
import UserRoutes from "./groups/UserRoutes";
import AdminRoutes from "./groups/AdminRoutes";
import SettingsRoutes from "./groups/SettingsRoutes";
import PremiumRoutes from "./groups/PremiumRoutes";
import PaymentRoutes from "./groups/PaymentRoutes";

/**
 * Application routes organized by categories:
 * - Public routes (no authentication required)
 * - User routes (require basic authentication)
 * - Admin routes (require admin role)
 * - Settings routes (user preferences and profile)
 * - Premium routes (require premium subscription)
 * - Payment routes (subscription and payment processing)
 */
const AppRoutes = () => {
  console.log('AppRoutes rendering - Admin route should be available via AdminRoutes');
  
  return (
    <Routes>
      {/* Include all route groups */}
      <PublicRoutes />
      <UserRoutes />
      <AdminRoutes />
      <SettingsRoutes />
      <PremiumRoutes />
      <PaymentRoutes />
      
      {/* Direct Admin Route for Debugging */}
      <Route path="/direct-admin" element={<Admin />} />
      
      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
