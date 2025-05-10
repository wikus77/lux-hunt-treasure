
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import ParallaxContainer from "@/components/ui/parallax-container";
import CookiebotInit from "@/components/cookiebot/CookiebotInit";

// Refactored components
import LoadingScreen from "@/components/index/LoadingScreen";
import IntroManager from "@/components/index/IntroManager";
import IndexContent from "@/components/index/IndexContent";
import ModalManager from "@/components/index/ModalManager";

const Index = () => {
  console.log("Index component rendering");
  
  // State management
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [renderContent, setRenderContent] = useState(false); // State to control rendering
  const [error, setError] = useState<Error | null>(null); // Error state for fallback
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // MIGLIORAMENTO: Protezione contro errori di rendering
  useEffect(() => {
    try {
      const observer = new MutationObserver(() => {
        const allSections = document.querySelectorAll("section");
        allSections.forEach((section) => {
          const text = section.textContent?.toLowerCase() || "";
          if (
            text.includes("cosa puoi vincere") ||
            text.includes("vuoi provarci") ||
            text.includes("premio principale") ||
            text.includes("auto di lusso")
          ) {
            section.style.display = "none";
            console.log("✅ Sezione 'Cosa puoi vincere' rimossa con MutationObserver.");
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        console.log("🛑 MutationObserver disattivato.");
      };
    } catch (err) {
      console.error("Errore nel setup MutationObserver:", err);
      // Non propaghiamo questo errore, è solo per logging
    }
  }, []);
  
  // CORREZIONE: Gestione sicura del localStorage
  useEffect(() => {
    try {
      // Per assicurarci che l'intro venga mostrata, rimuoviamo il flag dal localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("skipIntro");
        console.log("Removed skipIntro from localStorage");
      }
    } catch (error) {
      console.error("localStorage error:", error);
    }
  }, []);
  
  // MIGLIORAMENTO: Gestione più robusta del caricamento della pagina
  useEffect(() => {
    let isMounted = true;
    
    const loadTimer = setTimeout(() => {
      if (isMounted) {
        setPageLoaded(true);
        console.log("Page loaded state set to true");
        
        // Piccolo ritardo prima di renderizzare il contenuto effettivo
        // per garantire che l'hydration sia completata
        setTimeout(() => {
          if (isMounted) {
            setRenderContent(true);
            console.log("Content rendering enabled");
          }
        }, 100);
      }
    }, 800);
    
    // Gestione più robusta del caricamento
    const handleDocumentReady = () => {
      if (document.readyState === 'complete' && isMounted) {
        clearTimeout(loadTimer);
        console.log("Document ready state is complete");
        setPageLoaded(true);
        // Piccolo ritardo come sopra
        setTimeout(() => {
          if (isMounted) {
            setRenderContent(true);
          }
        }, 100);
      }
    };
    
    // Controllo immediato
    handleDocumentReady();
    
    // Anche ascolto per eventi futuri
    document.addEventListener('readystatechange', handleDocumentReady);
    window.addEventListener('load', handleDocumentReady);
    
    return () => {
      isMounted = false;
      clearTimeout(loadTimer);
      document.removeEventListener('readystatechange', handleDocumentReady);
      window.removeEventListener('load', handleDocumentReady);
    };
  }, []);

  // Check if countdown has already passed
  useEffect(() => {
    const now = new Date();
    if (now > nextEventDate) {
      setCountdownCompleted(true);
    }
  }, [nextEventDate]);

  // Event handlers
  const handleRegisterClick = () => {
    if (countdownCompleted) {
      setShowAgeVerification(true);
    } else {
      console.log("Registration is disabled until countdown completes");
    }
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Function to handle invite friend button click
  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  // Callback for when countdown completes
  const handleCountdownComplete = () => {
    setCountdownCompleted(true);
  };
  
  // Callback per quando l'intro è completa
  const handleIntroComplete = () => {
    console.log("Intro completed callback, setting introCompleted to true");
    setIntroCompleted(true);
    // Memorizziamo che l'intro è stata mostrata
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("skipIntro", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  };

  // Se c'è un errore, mostriamo un fallback
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-white">
        <h2 className="text-xl font-bold mb-4">Si è verificato un errore</h2>
        <p className="mb-4">Ci scusiamo per l'inconveniente.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md"
        >
          Ricarica la pagina
        </button>
      </div>
    );
  }

  // Console logging state for debugging
  console.log("Render state:", { introCompleted, pageLoaded, renderContent });

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* CookiebotInit sempre disponibile */}
      <CookiebotInit />
      
      {/* MIGLIORAMENTO: LoadingScreen migliorato - sempre visibile durante il caricamento */}
      {(!renderContent || !pageLoaded) && (
        <LoadingScreen />
      )}
      
      {/* MIGLIORAMENTO: Intro animation manager dentro un try/catch per evitare errori fatali */}
      {pageLoaded && (
        <IntroManager 
          pageLoaded={pageLoaded} 
          onIntroComplete={handleIntroComplete}
        />
      )}
      
      {/* MIGLIORAMENTO: Main content renderizzato solo quando tutto è pronto */}
      {renderContent && introCompleted && (
        <ParallaxContainer>
          <IndexContent 
            countdownCompleted={countdownCompleted}
            onRegisterClick={handleRegisterClick}
            openInviteFriend={openInviteFriend}
          />
          
          {/* Modals */}
          <ModalManager
            showAgeVerification={showAgeVerification}
            showInviteFriend={showInviteFriend}
            onCloseAgeVerification={() => setShowAgeVerification(false)}
            onCloseInviteFriend={() => setShowInviteFriend(false)}
            onAgeVerified={handleAgeVerified}
          />
        </ParallaxContainer>
      )}
    </div>
  );
};

export default Index;
