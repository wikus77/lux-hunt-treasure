import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Spinner } from "@/components/ui/spinner";
import IOSSafeAreaOverlay from "@/components/debug/IOSSafeAreaOverlay";
import WelcomeRedirect from "@/pages/WelcomeRedirect";

// Public routes with lazy loading
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));

// Main app routes with lazy loading - SEPARATE FROM LANDING
const AppHome = lazy(() => import("@/pages/AppHome"));
const Map = lazy(() => import("@/pages/Map"));
const Buzz = lazy(() => import("@/pages/Buzz"));
const Games = lazy(() => import("@/pages/Games"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const MissionSelection = lazy(() => import("@/pages/MissionSelection"));

// Additional routes
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));

// iOS Test route
const Open = lazy(() => import("@/pages/Open"));

// ✅ FIX: Landing page SOLO per web, NON per Capacitor
const Index = lazy(() => import("@/pages/Index"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* ✅ FIX: Root gestita da RootRedirect in App.tsx - NO LANDING PAGE */}
            <Route path="/" element={<WelcomeRedirect />} />

            {/* iOS Test Route - PUBLIC */}
            <Route path="/open" element={<Open />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ✅ FIX: Landing page SOLO per web - NO Capacitor */}
            <Route path="/landing" element={<Index />} />

            {/* Main App Routes - PROTECTED */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <AppHome />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Map />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/buzz"
              element={
                <ProtectedRoute>
                  <Buzz />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/notifications" element={<Notifications />} />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            
            <Route path="/select-mission" element={<MissionSelection />} />
            
            {/* Other routes */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default AppRoutes;
