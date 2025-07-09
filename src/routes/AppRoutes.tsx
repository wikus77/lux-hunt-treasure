import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import { useAuth } from "@/hooks/use-auth";

// Public routes
import Index from "@/pages/Index";

// Main app routes - STATIC IMPORTS FOR CAPACITOR iOS COMPATIBILITY
import AppHome from "@/pages/AppHome";
import Map from "@/pages/Map";
import Buzz from "@/pages/Buzz";
import Games from "@/pages/Games";
import Leaderboard from "@/pages/Leaderboard";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Subscriptions from "@/pages/Subscriptions";

// Auth routes
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MissionSelection from "@/pages/MissionSelection";

// Additional routes
import HowItWorks from "@/pages/HowItWorks";
import Contacts from "@/pages/Contacts";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Enhanced routing logic for Capacitor iOS - mobile compatible
  const isCapacitorApp = typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || 
     (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));

  console.log('🔍 ROUTING STATE:', {
    isAuthenticated,
    isLoading,
    isCapacitorApp,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Routes>
            {/* Landing page routing - Fixed for iOS */}
            <Route 
              path="/" 
              element={
                isCapacitorApp && isAuthenticated && !isLoading ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Index />
                )
              } 
            />

            {/* Main App Routes - PROTECTED */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <AppHome />
                </ProtectedRoute>
              }
            />
            
            {/* MAP ROUTE - iOS Optimized */}
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

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/select-mission" element={<MissionSelection />} />
            
            {/* Other routes */}
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default AppRoutes;
