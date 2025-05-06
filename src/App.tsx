
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import {
  AuthProvider,
  useAuthContext,
} from "@/contexts/auth";

// Import pages that are used directly
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy loaded components
const Home = lazy(() => import("@/pages/Home"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Map = lazy(() => import("@/pages/Map"));
const Profile = lazy(() => import("@/pages/Profile"));
const Stats = lazy(() => import("@/pages/Stats"));
const Settings = lazy(() => import("@/pages/Settings"));
const PrivacySecurity = lazy(() => import("@/pages/PrivacySecurity"));
const LanguageSettings = lazy(() => import("@/pages/LanguageSettings"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Buzz = lazy(() => import("@/pages/Buzz"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const Terms = lazy(() => import("@/pages/Terms"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Events = lazy(() => import("@/pages/Events"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const PaymentSilver = lazy(() => import("@/pages/PaymentSilver"));
const PaymentGold = lazy(() => import("@/pages/PaymentGold"));
const PaymentBlack = lazy(() => import("@/pages/PaymentBlack"));
const PaymentMethods = lazy(() => import("@/pages/PaymentMethods"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));

function App() {
  // Prevent browser back navigation after login/logout
  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", (e) => {
      window.history.pushState(null, "", window.location.pathname);
    });
    return () => {
      window.removeEventListener("popstate", () => {});
    };
  }, []);

  return (
    <AuthProvider>
      {/* Removed the Router component here */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected routes using children pattern */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/how-it-works" element={
            <ProtectedRoute>
              <HowItWorks />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/stats" element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/privacy-security" element={
            <ProtectedRoute>
              <PrivacySecurity />
            </ProtectedRoute>
          } />
          
          <Route path="/language-settings" element={
            <ProtectedRoute>
              <LanguageSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          <Route path="/buzz" element={
            <ProtectedRoute>
              <Buzz />
            </ProtectedRoute>
          } />
          
          <Route path="/contacts" element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-silver" element={
            <ProtectedRoute>
              <PaymentSilver />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-gold" element={
            <ProtectedRoute>
              <PaymentGold />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-black" element={
            <ProtectedRoute>
              <PaymentBlack />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-methods" element={
            <ProtectedRoute>
              <PaymentMethods />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
