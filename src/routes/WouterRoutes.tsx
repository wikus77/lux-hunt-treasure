// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/WouterProtectedRoute";
import GlobalLayout from "@/components/layout/GlobalLayout";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { shouldShowLanding, markFirstVisitCompleted } from "@/utils/firstVisitUtils";

// Static imports for first-visit flow
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";

// Lazy imports for core routes only
const AppHome = lazy(() => import("@/pages/AppHome"));
const LivingMap3D = lazy(() => import("@/pages/LivingMap3D"));
const BuzzPage = lazy(() => import("@/pages/BuzzPage").then(m => ({ default: m.BuzzPage })));
const HallOfWinnersStyledPage = lazy(() => import("@/pages/HallOfWinnersStyledPage"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Terms = lazy(() => import("@/pages/Terms"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mb-4"></div>
      <p className="text-foreground/60">Loading...</p>
    </div>
  </div>
);

const WouterRoutes = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useUnifiedAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/terms" component={Terms} />

          <Route path="/home">
            <ProtectedRoute><AppHome /></ProtectedRoute>
          </Route>

          <Route path="/map">
            <ProtectedRoute><LivingMap3D /></ProtectedRoute>
          </Route>

          <Route path="/buzz">
            <ProtectedRoute>
              <GlobalLayout><BuzzPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/winners">
            <ProtectedRoute>
              <GlobalLayout><HallOfWinnersStyledPage /></GlobalLayout>
            </ProtectedRoute>
          </Route>

          <Route path="/notifications">
            <ProtectedRoute><Notifications /></ProtectedRoute>
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

          <Route>
            {() => {
              if (isAuthenticated) {
                setLocation('/home');
              } else {
                setLocation('/login');
              }
              return null;
            }}
          </Route>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
};

export default WouterRoutes;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
