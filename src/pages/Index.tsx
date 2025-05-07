
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import ParallaxContainer from "@/components/ui/parallax-container";

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
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Hide specific sections that match certain text content
  useEffect(() => {
  const interval = setInterval(() => {
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
        console.log("✅ Sezione 'Cosa puoi vincere' nascosta.");
      }
    });
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    console.log("🛑 Fine controllo sezioni.");
  }, 7000);
}, []);

    const interval = setInterval(() => {
      const allSections = document.querySelectorAll("section");
      allSections.forEach((section) => {
        const text = section.textContent?.toLowerCase() || "";
        if (
          text.includes("vuoi provarci") ||
          text.includes("cosa puoi vincere")
        ) {
          section.style.display = "none";
          console.log("✅ Sezione nascosta con successo.");
        }
      });
    }, 500);

    // Ferma il controllo dopo 5 secondi
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Reset intro flag for testing purposes
  useEffect(() => {
    // Per assicurarci che l'intro venga mostrata, rimuoviamo il flag dal localStorage
    localStorage.removeItem("skipIntro");
  }, []);
  
  // Add a useEffect to mark when the page is fully loaded
  useEffect(() => {
    // Impostiamo direttamente pageLoaded a true dopo un breve ritardo
    // per garantire che i componenti abbiano il tempo di caricare
    const loadTimer = setTimeout(() => {
      setPageLoaded(true);
      console.log("Forced page loaded state to true");
    }, 800);
    
    if (document.readyState === 'complete') {
      console.log("Page already loaded");
      setPageLoaded(true);
    } else {
      console.log("Setting up load event listener");
      const handleLoad = () => {
        console.log("Page fully loaded");
        setPageLoaded(true);
      };
      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(loadTimer);
      };
    }
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
    localStorage.setItem("skipIntro", "true");
  };

  // Console logging state for debugging
  console.log("Render state:", { introCompleted, pageLoaded });

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Intro animation manager */}
      <IntroManager 
        pageLoaded={pageLoaded} 
        onIntroComplete={handleIntroComplete}
      />
      
      {/* Main content - shown after intro completes or fallback when intro fails */}
      {introCompleted && (
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

      {/* Fallback Loading Screen - mostrato solo quando l'intro non è completa e la pagina non è ancora caricata */}
      {!introCompleted && !pageLoaded && (
        <LoadingScreen />
      )}
    </div>
  );
};

export default Index;
