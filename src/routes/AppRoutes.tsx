
import { Navigate, Route, Routes } from "react-router-dom";
import { RoleBasedProtectedRoute } from "../components/auth/RoleBasedProtectedRoute";
import PublicLayout from "../components/layout/PublicLayout";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import Index from "../pages/Index";
import KYC from "../pages/KYC";
import Events from "../pages/Events";
import Profile from "../pages/Profile";
import Map from "../pages/Map";
import Buzz from "../pages/Buzz";
import Contacts from "../pages/Contacts";
import Subscriptions from "../pages/Subscriptions";
import Settings from "../pages/Settings";
import PersonalInfo from "../pages/PersonalInfo";
import PrivacySecurity from "../pages/PrivacySecurity";
import PaymentMethods from "../pages/PaymentMethods";
import PaymentSilver from "../pages/PaymentSilver";
import PaymentGold from "../pages/PaymentGold";
import PaymentBlack from "../pages/PaymentBlack";
import PaymentSuccess from "../pages/PaymentSuccess";
import EmailTest from "../pages/EmailTest";
import EmailCampaign from "../pages/EmailCampaign";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CookiePolicy from "../pages/CookiePolicy";
import HowItWorks from "../pages/HowItWorks";
import NotFound from "../pages/NotFound";
import LanguageSettings from "../pages/LanguageSettings";
import Stats from "../pages/Stats";
import Leaderboard from "../pages/Leaderboard";
import Notifications from "../pages/Notifications";
import AccessDenied from "../pages/AccessDenied";
import AdminDashboard from "../pages/AdminDashboard";
import { EmailVerificationPage } from "../components/auth/EmailVerificationHandler";

const AppRoutes = () => {
  return (
    <Routes>
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Base User Routes - Require Authentication */}
      <Route
        path="/home"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Home />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Events />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Profile />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Map />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/buzz"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Buzz />
          </RoleBasedProtectedRoute>
        }
      />

      {/* Admin Dashboard - Only for admin users */}
      <Route
        path="/admin"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedProtectedRoute>
        }
      />

      {/* Email Campaign - For admin users */}
      <Route
        path="/email-campaign"
        element={
          <RoleBasedProtectedRoute allowedRoles={['admin']}>
            <EmailCampaign />
          </RoleBasedProtectedRoute>
        }
      />

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

      {/* Premium Features - Require paid subscription or admin role */}
      <Route
        path="/stats"
        element={
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Stats />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <RoleBasedProtectedRoute allowedRoles={['premium_user', 'admin']}>
            <Leaderboard />
          </RoleBasedProtectedRoute>
        }
      />

      {/* Payment Routes - Available to all authenticated users */}
      <Route
        path="/subscriptions"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <Subscriptions />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentMethods />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-silver"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentSilver />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-gold"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentGold />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-black"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentBlack />
          </RoleBasedProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <RoleBasedProtectedRoute allowedRoles={['user', 'moderator', 'admin']}>
            <PaymentSuccess />
          </RoleBasedProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
