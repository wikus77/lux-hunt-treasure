
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from '@/components/theme-provider';
import { SoundProvider } from '@/contexts/SoundContext';
import AnimatedLogoReveal from './components/intro/AnimatedLogoReveal';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Events from './pages/Events';
import Buzz from './pages/Buzz';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Subscriptions from './pages/Subscriptions';
import PaymentSilver from './pages/PaymentSilver';
import PaymentGold from './pages/PaymentGold';
import PaymentBlack from './pages/PaymentBlack';
import PaymentMethods from './pages/PaymentMethods';
import MainLayout from './components/layout/MainLayout';
import Leaderboard from './pages/Leaderboard';

const queryClient = new QueryClient();

function App() {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [appReady, setAppReady] = useState<boolean>(false);
  
  // Gestione sicura del preloader dell'app
  useEffect(() => {
    // Imposta immediatamente l'app come pronta
    setAppReady(true);
    
    // Controlla se mostrare l'animazione del logo solo se non è già stata mostrata
    const appIntroShown = localStorage.getItem('appIntroShown');
    
    // Se siamo in development, salta l'intro
    const skipInDev = import.meta.env.DEV;
    
    if (!appIntroShown && !skipInDev) {
      console.log("Mostrando l'animazione del logo");
      setShowIntro(true);
    } else {
      console.log("Animazione del logo già mostrata o saltata in dev mode");
      setShowIntro(false);
    }
  }, []);

  // Gestione del completamento dell'intro
  const handleIntroComplete = () => {
    console.log("Animazione del logo completata");
    setShowIntro(false);
    localStorage.setItem('appIntroShown', 'true');
  };

  // Componente di fallback durante il caricamento
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-2xl">Caricamento...</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ThemeProvider>
          <SoundProvider>
            {showIntro ? (
              <AnimatedLogoReveal onComplete={handleIntroComplete} />
            ) : (
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<MainLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/buzz" element={<Buzz />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/payment-silver" element={<PaymentSilver />} />
                <Route path="/payment-gold" element={<PaymentGold />} />
                <Route path="/payment-black" element={<PaymentBlack />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
              </Routes>
            )}
          </SoundProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
