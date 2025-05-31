import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DynamicIsland from "@/components/DynamicIsland";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth/useAuthContext";

// Public route
import Index from "@/pages/Index";

// Lazy-loaded protected routes
const Home = lazy(() => import("@/pages/Home"));
const Map = lazy(() => import("@/pages/Map"));
const Buzz = lazy(() => import("@/pages/Buzz"));
const Games = lazy(() => import("@/pages/Games"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));

// Auth pages
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const MissionSelection = lazy(() => import("@/pages/MissionSelection"));

// Informational routes
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { user } = useAuthContext();
  const isDeveloper = user?.email === "wikus77@hotmail.it";

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <DynamicIsland />
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Index />} />

          {/* Vera Home dell'app (protetta) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Redirect da /dashboard verso /home */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />

          {/* Altre pagine protette */}
          <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/buzz" element={<ProtectedRoute><Buzz /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Notifiche (anche non protette) */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select-mission" element={<MissionSelection />} />

          {/* Extra */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;

