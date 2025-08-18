// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - App Routes - Fixed Buzz route cache issue
import React from "react";
import { Router, Route } from "wouter";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useAuth } from "@/hooks/use-auth";

// Public routes
import Index from "@/pages/Index";
import CinematicHomePage from "@/pages/CinematicHomePage";

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
import PaymentsHistoryPage from "@/pages/profile/PaymentsHistoryPage";

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
        <Router>
            {/* Landing page routing - Xavier Cusso Style */}
            <Route 
              path="/"
              component={() => 
                isCapacitorApp && isAuthenticated && !isLoading ? (
                  <Index />
                ) : (
                  <Index />
                )
              } 
            />

            {/* Main App Routes - PROTECTED with GlobalLayout */}
            <Route
              path="/home"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <AppHome />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            {/* MAP ROUTE - iOS Optimized */}
            <Route
              path="/map"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <Map />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            <Route
              path="/buzz"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    {(() => {
                      console.log('🔍 BUZZ ROUTE: Rendering BuzzPage component');
                      return <BuzzPage />;
                    })()}
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            <Route
              path="/games"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <Games />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            <Route
              path="/leaderboard"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <Leaderboard />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            <Route 
              path="/notifications" 
              component={() => (
                <GlobalLayout>
                  <Notifications />
                </GlobalLayout>
              )}
            />
            
            <Route
              path="/profile"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <Profile />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            {/* Profile subpages - BY JOSEPH MULE */}
            <Route
              path="/profile/personal-info"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <PersonalInfoPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            <Route
              path="/profile/security"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <SecurityPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            <Route
              path="/profile/payments"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <PaymentsHistoryPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />
            
            <Route 
              path="/settings" 
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <SettingsPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            {/* Legal Routes - BY JOSEPH MULE */}
            <Route path="/legal/terms" component={() => <LegalTerms />} />
            <Route path="/legal/privacy" component={() => <Privacy />} />
            <Route path="/legal/safecreative" component={() => <SafeCreative />} />

            <Route
              path="/subscriptions"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <Subscriptions />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            {/* Subscription plan pages - BY JOSEPH MULE */}
            <Route
              path="/subscriptions/silver"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <SilverPlanPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            <Route
              path="/subscriptions/gold"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <GoldPlanPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            <Route
              path="/subscriptions/black"
              component={() => (
                <ProtectedRoute>
                  <GlobalLayout>
                    <BlackPlanPage />
                  </GlobalLayout>
                </ProtectedRoute>
              )}
            />

            {/* Auth routes */}
            <Route path="/login" component={() => <Login />} />
            <Route path="/register" component={() => <Register />} />
            <Route path="/select-mission" component={() => <MissionSelection />} />
            
            {/* Other routes */}
            <Route path="/how-it-works" component={() => <HowItWorks />} />
            <Route path="/contacts" component={() => <Contacts />} />
            <Route path="/privacy-policy" component={() => <PrivacyPolicy />} />
            <Route path="/terms" component={() => <Terms />} />
            
            {/* 404 route */}
            <Route path="*" component={() => <NotFound />} />
        </Router>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default AppRoutes;
