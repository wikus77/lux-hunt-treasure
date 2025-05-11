
import { Navigate, Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import Index from "../pages/Index";
import KYC from "../pages/KYC";
import Contacts from "../pages/Contacts";
import EmailTest from "../pages/EmailTest";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CookiePolicy from "../pages/CookiePolicy";
import HowItWorks from "../pages/HowItWorks";
import AccessDenied from "../pages/AccessDenied";
import { EmailVerificationPage } from "../components/auth/EmailVerificationHandler";

export const PublicRoutes = () => {
  return (
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/kyc" element={<KYC />} />
      <Route path="/verification" element={<EmailVerificationPage />} />
      <Route path="/contact" element={<Contacts />} />
      <Route path="/email-test" element={<EmailTest />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* The email-campaign route has been moved to AppRoutes.tsx */}
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Route>
  );
};
