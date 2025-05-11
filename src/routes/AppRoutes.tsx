
import { Navigate, Route, Routes } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import { settingsRoutes } from "./settingsRoutes";
import { premiumRoutes } from "./premiumRoutes";
import { paymentRoutes } from "./paymentRoutes";
import NotFound from "../pages/NotFound";

/**
 * Main application routes component
 * Combines all route groups into a single component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes}
      
      {/* Base authenticated user routes */}
      {userRoutes}
      
      {/* Admin routes */}
      {adminRoutes}
      
      {/* Settings routes */}
      {settingsRoutes}
      
      {/* Premium features routes */}
      {premiumRoutes}
      
      {/* Payment routes */}
      {paymentRoutes}
      
      {/* Fallback routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
