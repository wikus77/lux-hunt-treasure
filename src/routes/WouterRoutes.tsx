// M1SSION™ - Wouter Routes for Capacitor iOS Compatibility
// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import React from "react";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/WouterProtectedRoute";
import { IOSSafeAreaOverlay } from "@/components/debug/IOSSafeAreaOverlay";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useAuth } from "@/hooks/use-auth";

// Static imports for Capacitor iOS compatibility
import Index from "@/pages/Index";
import AppHome from "@/pages/AppHome";
import Map from "@/pages/Map";
import { BuzzPage } from "@/pages/BuzzPage";
import Games from "@/pages/Games";
import Leaderboard from "@/pages/Leaderboard";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/settings/SettingsPage";
import Subscriptions from "@/pages/Subscriptions";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const WouterRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const isCapacitorApp = typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || 
     (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));

  console.log('🔍 WOUTER ROUTING STATE:', {
    isAuthenticated,
    isLoading,
    isCapacitorApp,
    timestamp: new Date().toISOString()
  });

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Switch>
          {/* Landing page */}
          <Route path="/">
            {isCapacitorApp && isAuthenticated && !isLoading ? (
              <GlobalLayout><AppHome /></GlobalLayout>
            ) : (
              <Index />
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

          <Route path="/games">
            <ProtectedRoute>
              <GlobalLayout><Games /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/leaderboard">
            <ProtectedRoute>
              <GlobalLayout><Leaderboard /></GlobalLayout>
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

          <Route path="/subscriptions">
            <ProtectedRoute>
              <GlobalLayout><Subscriptions /></GlobalLayout>
            </ProtectedRoute>
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