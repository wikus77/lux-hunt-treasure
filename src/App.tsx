
import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider, useSoundContext } from "./contexts/SoundContext";
import { toast } from "sonner";
import { supabase } from "./integrations/supabase/client";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import Buzz from "./pages/Buzz";
import Contacts from "./pages/Contacts";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import PersonalInfo from "./pages/PersonalInfo";
import PrivacySecurity from "./pages/PrivacySecurity";
import PaymentMethods from "./pages/PaymentMethods";
import PaymentSilver from "./pages/PaymentSilver";
import PaymentGold from "./pages/PaymentGold";
import PaymentBlack from "./pages/PaymentBlack";
import PaymentSuccess from "./pages/PaymentSuccess";
import EmailTest from "./pages/EmailTest";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import LanguageSettings from "./pages/LanguageSettings";
import Stats from "./pages/Stats";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";

// Components
import { Toaster } from "sonner";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster as ShadcnToaster } from "./components/ui/toaster";
import PublicLayout from "./components/layout/PublicLayout";
import { EmailVerificationPage } from "./components/auth/EmailVerificationHandler";

// The AppContent component separates the App rendering logic from the provider setup
function AppContent() {
  const { isEnabled } = useSoundContext();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for the end of the hydration before using localStorage
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Check if the user has already been redirected to a specific payment page
    const hasRedirected = localStorage.getItem("paymentRedirected");

    if (hasRedirected) {
      // Remove the item from localStorage
      localStorage.removeItem("paymentRedirected");

      // Show a success toast
      toast.success("Pagamento effettuato con successo!", {
        description: "Grazie per il tuo supporto!",
      });
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      toast.success("Back online!", {
        description: "Connection to the server has been restored.",
      });
    };

    const handleOffline = () => {
      toast.error("No internet connection", {
        description:
          "Some features may be unavailable until the connection is restored.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const routes = (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verification" element={<EmailVerificationPage />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/email-test" element={<EmailTest />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <Subscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personal-info"
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-security"
        element={
          <ProtectedRoute>
            <PrivacySecurity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute>
            <PaymentMethods />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-silver"
        element={
          <ProtectedRoute>
            <PaymentSilver />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-gold"
        element={
          <ProtectedRoute>
            <PaymentGold />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-black"
        element={
          <ProtectedRoute>
            <PaymentBlack />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/language-settings"
        element={
          <ProtectedRoute>
            <LanguageSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <Stats />
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
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {hydrated ? (
          <>
            {routes}
            <Toaster />
            <ShadcnToaster />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}

export default App;
