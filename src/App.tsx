
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/layout/Footer";

// Pages
import Index from "./pages/Index";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Subscriptions from "./pages/Subscriptions";
import Events from "./pages/Events";
import Buzz from "./pages/Buzz";
import NotFound from "./pages/NotFound";
import PaymentMethods from "./pages/PaymentMethods";
import PersonalInfo from "./pages/PersonalInfo";
import PrivacySecurity from "./pages/PrivacySecurity";
import LanguageSettings from "./pages/LanguageSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/events" element={<Events />} />
            <Route path="/buzz" element={<Buzz />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/personal-info" element={<PersonalInfo />} />
            <Route path="/privacy-security" element={<PrivacySecurity />} />
            <Route path="/language-settings" element={<LanguageSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
