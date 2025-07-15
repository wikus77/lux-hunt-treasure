// by Joseph Mulé – M1SSION™ - Fixed Buzz route cache issue
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useAuth } from "@/hooks/use-auth";

// Public routes
import Index from "@/pages/Index";

// Main app routes - STATIC IMPORTS FOR CAPACITOR iOS COMPATIBILITY
import AppHome from "@/pages/AppHome";
import Map from "@/pages/Map";
import { BuzzPage } from "@/pages/BuzzPage";
import Games from "@/pages/Games";
import Leaderboard from "@/pages/Leaderboard";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/settings/SettingsPage";
import Subscriptions from "@/pages/Subscriptions";

// Legal pages - BY JOSEPH MULE
import LegalTerms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import SafeCreative from "@/pages/legal/SafeCreative";

// Profile subpages - BY JOSEPH MULE
import PersonalInfoPage from "@/pages/profile/PersonalInfoPage";
import SecurityPage from "@/pages/profile/SecurityPage";
import PaymentsPage from "@/pages/profile/PaymentsPage";

// Subscription plan pages - BY JOSEPH MULE
import SilverPlanPage from "@/pages/subscriptions/SilverPlanPage";
import GoldPlanPage from "@/pages/subscriptions/GoldPlanPage";
import BlackPlanPage from "@/pages/subscriptions/BlackPlanPage";

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

            {/* Main App Routes - PROTECTED with GlobalLayout */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <AppHome />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            {/* MAP ROUTE - iOS Optimized */}
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <Map />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/buzz"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    {(() => {
                      console.log('🔍 BUZZ ROUTE: Rendering BuzzPage component');
                      return <BuzzPage />;
                    })()}
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <Games />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <Leaderboard />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/notifications" 
              element={
                <GlobalLayout>
                  <Notifications />
                </GlobalLayout>
              } 
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <Profile />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            {/* Profile subpages - BY JOSEPH MULE */}
            <Route
              path="/profile/personal-info"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <PersonalInfoPage />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/security"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <SecurityPage />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/payments"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <PaymentsPage />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <SettingsPage />
                  </GlobalLayout>
                </ProtectedRoute>
              } 
            />

            {/* Legal Routes - BY JOSEPH MULE */}
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/safecreative" element={<SafeCreative />} />

            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <Subscriptions />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            {/* Subscription plan pages - BY JOSEPH MULE */}
            <Route
              path="/subscriptions/silver"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <SilverPlanPage />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscriptions/gold"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <GoldPlanPage />
                  </GlobalLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscriptions/black"
              element={
                <ProtectedRoute>
                  <GlobalLayout>
                    <BlackPlanPage />
                  </GlobalLayout>
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
