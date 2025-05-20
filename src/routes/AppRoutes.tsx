
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";

// Pages for direct routes
import PublicLayout from "../components/layout/PublicLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import KYC from "../pages/KYC";
import Contacts from "../pages/Contacts";
import EmailTest from "../pages/EmailTest";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CookiePolicy from "../pages/CookiePolicy";
import HowItWorks from "../pages/HowItWorks";
import AccessDenied from "../pages/AccessDenied";
import Index from "../pages/Index";
import { EmailVerificationPage } from "../components/auth/EmailVerificationHandler";

// Import route groups (now as components to include within routes)
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
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/verification" element={<EmailVerificationPage />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/contatti" element={<Contacts />} /> {/* Italian alias */}
        <Route path="/email-test" element={<EmailTest />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/termini-e-condizioni" element={<Terms />} /> {/* Italian alias */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* Alternative path */}
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>
      
      {/* User Routes - Require Authentication */}
      <UserRoutes />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Settings Routes */}
      <SettingsRoutes />
      
      {/* Premium Features Routes */}
      <PremiumRoutes />
      
      {/* Payment Routes */}
      <PaymentRoutes />
      
      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
