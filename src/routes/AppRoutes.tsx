
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import IOSSafeAreaOverlay from "@/components/debug/IOSSafeAreaOverlay";
import { useUnifiedAuthContext } from "@/contexts/auth/UnifiedAuthProvider";

// Public routes
import Index from "@/pages/Index";

// Main app routes with lazy loading
const AppHome = lazy(() => import("@/pages/AppHome"));
const Map = lazy(() => import("@/pages/Map"));
const Buzz = lazy(() => import("@/pages/Buzz"));
const Games = lazy(() => import("@/pages/Games"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));

// Auth routes
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const MissionSelection = lazy(() => import("@/pages/MissionSelection"));

// Additional routes
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useUnifiedAuthContext();

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Suspense
          fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <span className="text-gray-400">Caricamento...</span>
            </div>
          }
        >
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Index />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/home" element={isAuthenticated ? <AppHome /> : <Navigate to="/login" replace />} />
            <Route path="/map" element={isAuthenticated ? <Map /> : <Navigate to="/login" replace />} />
            <Route path="/buzz" element={isAuthenticated ? <Buzz /> : <Navigate to="/login" replace />} />
            <Route path="/games" element={isAuthenticated ? <Games /> : <Navigate to="/login" replace />} />
            <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/subscriptions" element={isAuthenticated ? <Subscriptions /> : <Navigate to="/login" replace />} />

            {/* Semi-protected routes */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/select-mission" element={<MissionSelection />} />

            {/* Public info pages */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default AppRoutes;

