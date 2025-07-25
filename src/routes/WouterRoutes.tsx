// M1SSION™ - Wouter Routes for Capacitor iOS Compatibility
// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import React from "react";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/WouterProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

// Static imports for Capacitor iOS compatibility
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import AppHome from "@/pages/AppHome";
import Map from "@/pages/Map";
import { BuzzPage } from "@/pages/BuzzPage";
import IntelligencePage from "@/pages/IntelligencePage";
import HallOfWinnersPage from "@/pages/HallOfWinnersPage";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/settings/SettingsPage";
import Subscriptions from "@/pages/Subscriptions";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SendNotificationPage from "@/pages/admin/SendNotificationPage";
import PanelAccessPage from "@/pages/PanelAccessPage";

import Terms from "@/pages/Terms";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import SafeCreative from "@/pages/SafeCreative";
import GameRules from "@/pages/GameRules";

// Subscription plan pages
import SilverPlanPage from "@/pages/subscriptions/SilverPlanPage";
import GoldPlanPage from "@/pages/subscriptions/GoldPlanPage";
import BlackPlanPage from "@/pages/subscriptions/BlackPlanPage";
import TitaniumPlanPage from "@/pages/subscriptions/TitaniumPlanPage";
import ChoosePlanPage from "@/pages/ChoosePlanPage";
import SubscriptionVerify from "@/pages/SubscriptionVerify";

const WouterRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useUnifiedAuth();

  const isCapacitorApp = typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || 
     (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));

  console.log('🔍 WOUTER ROUTING STATE DEBUG:', {
    isAuthenticated,
    isLoading,
    isCapacitorApp,
    currentPath: window.location.pathname,
    userExists: !!isAuthenticated,
    timestamp: new Date().toISOString()
  });

  console.log(`✅ ROUTE: Current path = ${window.location.pathname}`);
  console.log(`🔐 AUTH STATUS: isAuthenticated = ${isAuthenticated}, isLoading = ${isLoading}`);

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Switch>
          {/* Landing page - FIXED: Always show LandingPage to anonymous users */}
          <Route path="/">
            {isLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-white">Caricamento...</div>
              </div>
            ) : !isAuthenticated ? (
              <Index />
            ) : (
              <ProtectedRoute>
                <GlobalLayout><AppHome /></GlobalLayout>
              </ProtectedRoute>
            )}
          </Route>

          {/* Protected routes */}
          <Route path="/home">
            <ProtectedRoute>
              <GlobalLayout><AppHome /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/map">
            <ProtectedRoute>
              <GlobalLayout><Map /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/buzz">
            <ProtectedRoute>
              <GlobalLayout><BuzzPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/intelligence">
            <ProtectedRoute>
              <GlobalLayout><IntelligencePage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/leaderboard">
            <ProtectedRoute>
              <GlobalLayout><HallOfWinnersPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/notifications">
            <GlobalLayout><Notifications /></GlobalLayout>
          </Route>

          <Route path="/profile">
            <ProtectedRoute>
              <GlobalLayout><Profile /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings">
            <ProtectedRoute>
              <GlobalLayout><SettingsPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/settings/:section">
            <ProtectedRoute>
              <GlobalLayout><SettingsPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions">
            <ProtectedRoute>
              <GlobalLayout><Subscriptions /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Subscription plan pages */}
          <Route path="/subscriptions/silver">
            <ProtectedRoute>
              <GlobalLayout><SilverPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/gold">
            <ProtectedRoute>
              <GlobalLayout><GoldPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/black">
            <ProtectedRoute>
              <GlobalLayout><BlackPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/subscriptions/titanium">
            <ProtectedRoute>
              <GlobalLayout><TitaniumPlanPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          {/* Admin routes */}
          <Route path="/admin/send-notification">
            <ProtectedRoute>
              <SendNotificationPage />
            </ProtectedRoute>
          </Route>

          {/* Panel Access route */}
          <Route path="/panel-access">
            <ProtectedRoute>
              <GlobalLayout><PanelAccessPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>


          {/* Legal routes */}
          <Route path="/terms">
            <GlobalLayout><Terms /></GlobalLayout>
          </Route>
          
          <Route path="/privacy-policy">
            <GlobalLayout><PrivacyPolicy /></GlobalLayout>
          </Route>
          
          <Route path="/cookie-policy">
            <GlobalLayout><CookiePolicy /></GlobalLayout>
          </Route>
          
          <Route path="/safecreative">
            <GlobalLayout><SafeCreative /></GlobalLayout>
          </Route>
          
          <Route path="/game-rules">
            <GlobalLayout><GameRules /></GlobalLayout>
          </Route>

          {/* Plan selection route - accessible even without plan selected */}
          <Route path="/choose-plan">
            {isAuthenticated ? (
              <GlobalLayout><ChoosePlanPage /></GlobalLayout>
            ) : (
              <Login />
            )}
          </Route>

          {/* Subscription verification route */}
          <Route path="/subscription-verify">
            {isAuthenticated ? (
              <SubscriptionVerify />
            ) : (
              <Login />
            )}
          </Route>

          {/* Auth routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />

          {/* 404 fallback */}
          <Route>
            <GlobalLayout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">404 - Pagina non trovata</h1>
                  <button onClick={() => window.location.href = '/home'}>
                    Torna alla Home
                  </button>
                </div>
              </div>
            </GlobalLayout>
          </Route>
        </Switch>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default WouterRoutes;