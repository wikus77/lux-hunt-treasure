
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import IntroAnimation from "@/components/intro/IntroAnimation";
import PresentationSection from "@/components/landing/PresentationSection";
import NextEventCountdown from "@/components/landing/NextEventCountdown";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHeader from "@/components/landing/LandingHeader";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";

const Index = () => {
  // Stato per il controllo del contenuto da visualizzare
  const [showIntro, setShowIntro] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Set date for countdown (one month from today)
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  // Gestione sicura del caricamento iniziale con timeouts di sicurezza
  useEffect(() => {
    try {
      console.log("Inizializzazione Index page");
      
      // Mostra immediatamente un contenuto per evitare pagina bianca
      setContentReady(true);
      
      // Determina se è un refresh della pagina
      const isPageRefresh = 
        (window.performance.navigation && window.performance.navigation.type === 1) || 
        (() => {
          const entries = window.performance.getEntriesByType('navigation');
          return entries.length > 0 && 
            (entries[0] as PerformanceNavigationTiming).type === 'reload';
        })();
      
      console.log("È un refresh della pagina?", isPageRefresh ? "Sì" : "No");
      
      // Verifica più sicura dell'intro già mostrato
      const introShown = localStorage.getItem('introShown') === 'true';
      console.log("Intro già mostrato?", introShown ? "Sì" : "No");
      
      // Mostra l'intro solo se non è già stato mostrato E non siamo in refresh
      if (!introShown && !isPageRefresh) {
        console.log("Mostrando l'intro per la prima volta");
        setShowIntro(true);
        // Impostiamo subito il flag per evitare ripetizioni in caso di problemi
        localStorage.setItem('introShown', 'true');
        
        // Timeout di sicurezza che forza la conclusione dell'intro dopo 7 secondi
        // se per qualche motivo l'animazione non si concludesse
        setTimeout(() => {
          console.log("Timeout di sicurezza: forzatura conclusione intro");
          setShowIntro(false);
        }, 7000);
      } else {
        console.log("Intro già mostrato o refresh rilevato - mostrando direttamente il contenuto");
        setShowIntro(false);
      }
    } catch (error) {
      console.error("Errore durante l'inizializzazione:", error);
      // Assicuriamoci che il contenuto sia visibile anche in caso di errore
      setContentReady(true);
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    console.log("Intro completato, nascondendo animazione");
    setShowIntro(false);
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Componente fallback durante il caricamento con un timeout di sicurezza
  useEffect(() => {
    // Se dopo 2 secondi contentReady è ancora false, lo forziamo a true
    const safetyTimeout = setTimeout(() => {
      if (!contentReady) {
        console.log("Timeout di sicurezza: forzatura contentReady");
        setContentReady(true);
        setShowIntro(false);
      }
    }, 2000);
    
    return () => clearTimeout(safetyTimeout);
  }, [contentReady]);

  if (!contentReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-orbitron text-center mb-4">M1SSION</h1>
          <p className="text-center">Caricamento in corso...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Mostra l'animazione intro solo se necessario */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Mostra sempre il contenuto principale, ma nascosto solo se l'intro è attivo */}
      <div className={`transition-opacity duration-500 ${showIntro ? "opacity-0" : "opacity-100"}`}>
        <UnifiedHeader />
        <div className="h-[72px] w-full" />
        <LandingHeader />
        <PresentationSection visible={!showIntro} />
        <NextEventCountdown targetDate={nextEventDate} />
        <HowItWorks onRegisterClick={handleRegisterClick} />
        <LuxuryCarsSection />
        <CTASection onRegisterClick={handleRegisterClick} />
        <LandingFooter />
        <AgeVerificationModal
          open={showAgeVerification}
          onClose={() => setShowAgeVerification(false)}
          onVerified={handleAgeVerified}
        />
      </div>
    </div>
  );
};

export default Index;
