
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
      
      // Rendere il body visibile subito
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      
      // Verifica esplicita del refresh dalla sessionStorage impostata in main.tsx
      const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true';
      console.log("Rilevato refresh da sessionStorage:", wasRefreshed ? "Sì" : "No");
      
      // Verifica dell'intro già mostrato (con fallback che forza a true in caso di problemi)
      const introShownRaw = localStorage.getItem('introShown');
      const introShown = introShownRaw === 'true' || wasRefreshed;
      console.log("Intro già mostrato?", introShown ? "Sì" : "No");
      
      // Mostra l'intro solo se non è già stato mostrato E non siamo in refresh
      if (!introShown && !wasRefreshed) {
        console.log("Mostrando l'intro per la prima volta");
        setShowIntro(true);
        // Impostiamo subito il flag per evitare ripetizioni in caso di problemi
        localStorage.setItem('introShown', 'true');
        
        // Timeout di sicurezza che forza la conclusione dell'intro dopo 4 secondi
        // se per qualche motivo l'animazione non si concludesse
        const safetyIntroTimeout = setTimeout(() => {
          console.log("Timeout di sicurezza: forzatura conclusione intro");
          setShowIntro(false);
        }, 4000);
        
        return () => clearTimeout(safetyIntroTimeout);
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
    
    // Al montaggio, assicuriamoci che l'applicazione sia visibile
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    // Timer di sicurezza aggiuntivo
    const visibilityTimer = setInterval(() => {
      if (document.body.style.visibility !== 'visible' || 
          document.body.style.opacity !== '1') {
        console.log("Correzione visibilità periodica");
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      }
    }, 1000);
    
    return () => clearInterval(visibilityTimer);
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
    // Se dopo 800ms contentReady è ancora false, lo forziamo a true
    const safetyTimeout = setTimeout(() => {
      if (!contentReady) {
        console.log("Timeout di sicurezza: forzatura contentReady");
        setContentReady(true);
        setShowIntro(false);
      }
    }, 800);
    
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
