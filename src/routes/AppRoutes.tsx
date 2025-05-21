
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

// Import delle pagine/componenti dalle route groups
import Login from "../pages/Login";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import KYC from "../pages/KYC";
import Contacts from "../pages/Contacts";
import EmailTest from "../pages/EmailTest";
import CookiePolicy from "../pages/CookiePolicy";
import HowItWorks from "../pages/HowItWorks";
import AccessDenied from "../pages/AccessDenied";
import Index from "../pages/Index";
import { EmailVerificationPage } from "../components/auth/EmailVerificationHandler";
import PublicLayout from "../components/layout/PublicLayout";
import PersonalInfo from "../pages/PersonalInfo";
import PrivacySecurity from "../pages/PrivacySecurity";
import LanguageSettings from "../pages/LanguageSettings";
import PaymentMethods from "../pages/PaymentMethods";
import PaymentSilver from "../pages/PaymentSilver";
import Leaderboard from "../pages/Leaderboard";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";
import Admin from "../pages/Admin";
import AdminPrizeClues from "../pages/AdminPrizeClues";
import AdminPrizes from "../pages/AdminPrizes";
import Events from "../pages/Events";
import TestAgent from "../pages/TestAgent";
import AdminPrizeForm from "../pages/AdminPrizeForm";

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

  // Verifica se current date è prima del 21 Maggio 2025
  const bypassAdminProtection = () => {
    const expirationDate = new Date('2025-05-21T00:00:00');
    const currentDate = new Date();
    return currentDate < expirationDate;
  };
  
  const baseUserRoles = ['user', 'moderator', 'admin'];
  
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
      
      {/* Public Routes */}
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
      
      {/* User Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/buzz" element={<ProtectedRoute><Buzz /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
      <Route path="/test-agent" element={<ProtectedRoute><TestAgent /></ProtectedRoute>} />
      <Route path="/admin-prize-form" element={<ProtectedRoute><AdminPrizeForm /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={bypassAdminProtection() ? <Admin /> : <RoleBasedProtectedRoute allowedRoles={['admin']}><Admin /></RoleBasedProtectedRoute>} />
      <Route path="/admin/prizes" element={<AdminPrizes />} />
      <Route path="/admin/prize-clues" element={<AdminPrizeClues />} />
      
      {/* Settings Routes */}
      <Route path="/settings" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><Settings /></RoleBasedProtectedRoute>} />
      <Route path="/personal-info" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PersonalInfo /></RoleBasedProtectedRoute>} />
      <Route path="/privacy-security" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PrivacySecurity /></RoleBasedProtectedRoute>} />
      <Route path="/language-settings" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><LanguageSettings /></RoleBasedProtectedRoute>} />
      <Route path="/notifications" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><Notifications /></RoleBasedProtectedRoute>} />
      
      {/* Premium Routes */}
      <Route path="/stats" element={<RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}><Stats /></RoleBasedProtectedRoute>} />
      <Route path="/leaderboard" element={<RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}><Leaderboard /></RoleBasedProtectedRoute>} />
      
      {/* Payment Routes */}
      <Route path="/subscriptions" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><Subscriptions /></RoleBasedProtectedRoute>} />
      <Route path="/payment-methods" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PaymentMethods /></RoleBasedProtectedRoute>} />
      <Route path="/payment-silver" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PaymentSilver /></RoleBasedProtectedRoute>} />
      <Route path="/payment-gold" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PaymentGold /></RoleBasedProtectedRoute>} />
      <Route path="/payment-black" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PaymentBlack /></RoleBasedProtectedRoute>} />
      <Route path="/payment-success" element={<RoleBasedProtectedRoute allowedRoles={baseUserRoles}><PaymentSuccess /></RoleBasedProtectedRoute>} />
      
      {/* Catch all other routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
