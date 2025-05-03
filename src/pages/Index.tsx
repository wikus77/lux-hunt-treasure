
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

  // Gestione sicura del caricamento iniziale
  useEffect(() => {
    try {
      console.log("Inizializzazione Index page");
      
      // Mostra immediatamente un contenuto per evitare pagina bianca
      setContentReady(true);
      
      // Controlla se mostrare l'intro
      const introShown = localStorage.getItem('introShown');
      console.log("Intro già mostrato?", introShown ? "Sì" : "No");
      
      // Mostra l'intro solo se non è già stato mostrato
      // Ma solo se non siamo in una sessione di refresh (controlliamo sessionStorage)
      const isPageRefresh = sessionStorage.getItem('pageLoaded');
      
      if (!introShown && !isPageRefresh) {
        console.log("Mostrando l'intro per la prima volta");
        setShowIntro(true);
        localStorage.setItem('introShown', 'true');
      } else {
        console.log("Intro già mostrato o refresh rilevato");
        setShowIntro(false);
      }
      
      // Segna che la pagina è stata caricata in questa sessione
      sessionStorage.setItem('pageLoaded', 'true');
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

  // Componente fallback durante il caricamento
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
      <AnimatePresence>
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
