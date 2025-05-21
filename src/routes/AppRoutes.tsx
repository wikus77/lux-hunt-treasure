
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import Buzz from "../pages/Buzz";
import Map from "../pages/Map";
import Stats from "../pages/Stats";
import Settings from "../pages/Settings";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Subscriptions from "../pages/Subscriptions";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentGold from "../pages/PaymentGold";
import PaymentBlack from "../pages/PaymentBlack";

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
  console.log('AppRoutes rendering - All routes should be available');
  
  return (
    <Routes>
      {/* Include main pages directly for immediate access */}
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/buzz" element={<Buzz />} />
      <Route path="/map" element={<Map />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/termini-e-condizioni" element={<Terms />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-gold" element={<PaymentGold />} />
      <Route path="/payment-black" element={<PaymentBlack />} />
      
      {/* Include all route groups */}
      <PublicRoutes />
      <UserRoutes />
      <AdminRoutes />
      <SettingsRoutes />
      <PremiumRoutes />
      <PaymentRoutes />
      
      {/* Catch all other routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
