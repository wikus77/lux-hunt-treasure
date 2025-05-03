
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Set date for countdown (one month from today)
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  // Gestione sicura del caricamento iniziale con sistema migliorato
  useEffect(() => {
    try {
      console.log("Inizializzazione Index page");
      
      // Mostra immediatamente un contenuto per evitare pagina bianca
      setContentReady(true);
      
      // Assicura che il body sia sempre visibile
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      document.body.style.display = 'block';
      
      // Gestione più affidabile del rilevamento del refresh
      const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true' || 
                          (window.performance && 
                           window.performance.getEntriesByType &&
                           window.performance.getEntriesByType('navigation').length > 0 &&
                           (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'reload');
      
      console.log("Stato refresh rilevato:", wasRefreshed ? "Sì" : "No");
      
      // Sistema di gestione dell'intro più robusto
      const introShownRaw = localStorage.getItem('introShown');
      const introShown = introShownRaw === 'true' || wasRefreshed;
      console.log("Intro già mostrato?", introShown ? "Sì" : "No");
      
      // Se è un refresh, forziamo la visibilità e skippiamo l'intro
      if (wasRefreshed) {
        console.log("Refresh rilevato: mostro direttamente il contenuto e salto l'intro");
        setShowIntro(false);
        // Garantiamo la visibilità del body in caso di refresh
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
      } 
      // Se l'intro non è stato mostrato e non è un refresh
      else if (!introShown) {
        console.log("Prima visita: mostro l'intro");
        setShowIntro(true);
        // Impostiamo subito il flag per evitare ripetizioni in caso di problemi
        localStorage.setItem('introShown', 'true');
      } 
      // In ogni altro caso, saltiamo l'intro 
      else {
        console.log("Intro già mostrato: mostro direttamente il contenuto");
        setShowIntro(false);
      }
    } catch (error) {
      console.error("Errore durante l'inizializzazione:", error);
      // Salviamo l'errore ma mostriamo comunque un contenuto
      setLoadError(error instanceof Error ? error.message : "Errore sconosciuto");
      setContentReady(true);
      setShowIntro(false);
      // Anche in caso di errore, garantiamo la visibilità
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      document.body.style.display = 'block';
    }
  }, []);

  // Timer di sicurezza per garantire la visibilità della pagina ogni 500ms
  useEffect(() => {
    const visibilityTimer = setInterval(() => {
      if (document.body.style.visibility !== 'visible' || 
          document.body.style.opacity !== '1') {
        console.log("Forzatura visibilità periodica");
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        document.body.style.display = 'block';
      }
    }, 500);
    
    // Timer di sicurezza che forza contentReady a true dopo 1 secondo
    const contentReadyTimer = setTimeout(() => {
      if (!contentReady) {
        console.log("Forzatura contentReady dopo timeout");
        setContentReady(true);
      }
    }, 1000);
    
    // Timer di sicurezza che forza la fine dell'intro dopo 5 secondi
    const introTimer = setTimeout(() => {
      if (showIntro) {
        console.log("Forzatura fine intro dopo timeout di sicurezza");
        setShowIntro(false);
      }
    }, 5000);
    
    return () => {
      clearInterval(visibilityTimer);
      clearTimeout(contentReadyTimer);
      clearTimeout(introTimer);
    };
  }, [showIntro, contentReady]);

  // Gestisce il completamento dell'intro animation
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

  // Componente di loading migliorato
  if (!contentReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-orbitron text-center mb-4">M1SSION</h1>
          <p className="text-center">Caricamento in corso...</p>
        </motion.div>
      </div>
    );
  }

  // Componente di errore migliorato
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-6 rounded-lg border border-red-500/30 bg-red-900/20">
          <h1 className="text-3xl font-orbitron mb-4">Errore di caricamento</h1>
          <p className="mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-700 rounded-md transition-colors"
          >
            Ricarica la pagina
          </button>
        </div>
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

      {/* Mostra sempre il contenuto principale */}
      <div 
        className={`transition-opacity duration-500 ${showIntro ? "opacity-0" : "opacity-100"}`}
        style={{ visibility: showIntro ? 'hidden' : 'visible' }}
      >
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
