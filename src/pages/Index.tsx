
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IntroAnimation from "@/components/intro/IntroAnimation";
import LandingContent from "@/components/landing/LandingContent";
import ErrorFallback from "@/components/errors/ErrorFallback";
import { useIntroAnimation } from "@/hooks/useIntroAnimation";

const Index = () => {
  // Stato ed effetti
  const { showIntro, introCompleted, handleIntroComplete, renderError } = useIntroAnimation();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const navigate = useNavigate();
  
  // Sicurezza: garantisce che il contenuto sia sempre visibile dopo 1.5 secondi
  useEffect(() => {
    const forceContentTimer = setTimeout(() => {
      console.log("INDEX SICUREZZA: Forzatura contenuto visibile");
      document.body.classList.add('content-visible');
    }, 1500);
    return () => clearTimeout(forceContentTimer);
  }, []);

  // Gestione sicura degli errori
  useEffect(() => {
    try {
      // Verifica che il DOM sia correttamente renderizzato
      const contentCheck = setTimeout(() => {
        const hasContent = document.querySelector('.landing-content');
        if (!hasContent) {
          console.warn("WARNING: Contenuto della landing non trovato nel DOM dopo l'attesa");
          setRenderFailed(true);
        } else {
          console.log("Contenuto della landing trovato nel DOM");
        }
      }, 2000);
      
      return () => clearTimeout(contentCheck);
    } catch (error) {
      console.error("Errore nel controllo rendering:", error);
      setRenderFailed(true);
    }
  }, []);
  
  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Recupero in caso di errori di rendering
  if (renderError || renderFailed) {
    return <ErrorFallback message="Si è verificato un problema nel caricamento. Riprova tra qualche istante." />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Animazione introduttiva (se necessaria) */}
      {showIntro && !introCompleted && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* CONTENUTO PRINCIPALE: Sempre visibile con controllo opacità */}
      <LandingContent 
        onRegisterClick={handleRegisterClick}
        showAgeVerification={showAgeVerification}
        onCloseAgeVerification={() => setShowAgeVerification(false)}
        onAgeVerified={handleAgeVerified}
        visible={!showIntro || introCompleted}
      />
    </div>
  );
};

export default Index;
