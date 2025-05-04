
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingContent from "@/components/landing/LandingContent";
import ErrorFallback from "@/components/errors/ErrorFallback";

const Index = () => {
  // Stati essenziali solo per la funzionalità
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const navigate = useNavigate();
  
  // Forza visibilità dei contenuti appena il componente viene montato
  useEffect(() => {
    console.log("INDEX: Forzatura contenuto visibile");
    
    // Forza stili necessari nel DOM
    document.body.style.backgroundColor = "#000";
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
    
    // Verifica che il contenuto sia effettivamente renderizzato
    setTimeout(() => {
      const content = document.querySelector('.landing-content');
      if (!content) {
        console.error("Contenuto non trovato nel DOM!");
        setRenderFailed(true);
      } else {
        console.log("Contenuto trovato, forzatura visibilità");
        (content as HTMLElement).style.display = "block";
        (content as HTMLElement).style.visibility = "visible";
        (content as HTMLElement).style.opacity = "1";
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

  // Mostra fallback in caso di errore di rendering
  if (renderFailed) {
    return <ErrorFallback message="Si è verificato un problema nel caricamento. Riprova tra qualche istante." />;
  }

  // Mostra direttamente il contenuto principale senza animazioni o condizioni
  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden" style={{opacity: 1, visibility: "visible"}}>
      <LandingContent 
        onRegisterClick={handleRegisterClick}
        showAgeVerification={showAgeVerification}
        onCloseAgeVerification={() => setShowAgeVerification(false)}
        onAgeVerified={handleAgeVerified}
        visible={true}
      />
    </div>
  );
};

export default Index;
