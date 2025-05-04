
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingContent from "@/components/landing/LandingContent";
import ErrorFallback from "@/components/errors/ErrorFallback";

const Index = () => {
  // Stati semplificati senza dipendere da useIntroAnimation
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const navigate = useNavigate();
  
  // Forza visibilità del contenuto immediatamente
  useEffect(() => {
    console.log("INDEX: Forzatura contenuto visibile immediata");
    
    // Aggiunge classe per forzare visibilità
    document.body.classList.add('content-visible');
    
    // Tentativo di visualizzare il contenuto
    setTimeout(() => {
      const content = document.querySelector('.landing-content');
      if (content) {
        console.log("Contenuto trovato, rendendo visibile");
        (content as HTMLElement).style.opacity = '1';
        (content as HTMLElement).style.display = 'block';
      } else {
        console.error("Contenuto non trovato nel DOM");
        setRenderFailed(true);
      }
    }, 100);
  }, []);

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Recupero in caso di errori di rendering
  if (renderFailed) {
    return <ErrorFallback message="Si è verificato un problema nel caricamento. Riprova tra qualche istante." />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* CONTENUTO PRINCIPALE: sempre visibile */}
      <LandingContent 
        onRegisterClick={handleRegisterClick}
        showAgeVerification={showAgeVerification}
        onCloseAgeVerification={() => setShowAgeVerification(false)}
        onAgeVerified={handleAgeVerified}
        visible={true} // Sempre visibile
      />
    </div>
  );
};

export default Index;
