import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DynamicIsland from "@/components/DynamicIsland";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/contexts/auth/useAuthContext";

// Import pubblico
import Index from "@/pages/Index";

// Lazy import protette
const Home = lazy(() => import("@/pages/Home"));
const Map = lazy(() => import("@/pages/Map"));
const Buzz = lazy(() => import("@/pages/Buzz"));
const Games = lazy(() => import("@/pages/Games"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const MissionSelection = lazy(() => import("@/pages/MissionSelection"));
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
  const location = useLocation();
  const isDeveloper = user?.email === "wikus77@hotmail.it";

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <DynamicIsland />

        <div
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
            minHeight: "100vh",
            backgroundColor: "black",
          }}
        >
          <Routes>

            {/* Landing page pubblica */}
            <Route path="/" element={<Index />} />

            {/* Home dell'app protetta */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Redirect compatibilità */}
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />

            {/* Rotte protette */}
            <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
            <Route path="/buzz" element={<ProtectedRoute><Buzz /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Rotte pubbliche */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/select-mission" element={<MissionSelection />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
