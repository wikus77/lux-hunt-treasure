
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { SoundProvider } from './contexts/SoundContext';

// Pages
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Subscriptions from "./pages/Subscriptions";
import Events from "./pages/Events";
import Buzz from "./pages/Buzz";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";
import PaymentMethods from "./pages/PaymentMethods";
import PersonalInfo from "./pages/PersonalInfo";
import PrivacySecurity from "./pages/PrivacySecurity";
import LanguageSettings from "./pages/LanguageSettings";
import Notifications from "./pages/Notifications";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contacts from "./pages/Contacts";
import PaymentSilver from "./pages/PaymentSilver";
import PaymentGold from "./pages/PaymentGold";
import PaymentBlack from "./pages/PaymentBlack";

const queryClient = new QueryClient();

const App = () => {
  return (
    <SoundProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-black text-white">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route element={<MainLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/buzz" element={<Buzz />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/payment-methods" element={<PaymentMethods />} />
                  <Route path="/personal-info" element={<PersonalInfo />} />
                  <Route path="/privacy-security" element={<PrivacySecurity />} />
                  <Route path="/language-settings" element={<LanguageSettings />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/payment/silver" element={<PaymentSilver />} />
                  <Route path="/payment/gold" element={<PaymentGold />} />
                  <Route path="/payment/black" element={<PaymentBlack />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </SoundProvider>
  );
};

export default App;
