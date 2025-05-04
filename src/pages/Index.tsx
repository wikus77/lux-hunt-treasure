
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import componenti della landing page
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PrizeShowcase from "@/components/landing/PrizeShowcase";
import HowItWorksSection from "@/components/landing/HowItWorksSection"; 
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import Navbar from "@/components/landing/Navbar";
import IntroAnimation from "@/components/intro/IntroAnimation";

const Index = () => {
  console.log("Index component rendering started");
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Sistema di diagnostica
  useEffect(() => {
    console.log("System info diagnostics:");
    console.log("- User Agent:", navigator.userAgent);
    console.log("- Screen size:", `${window.innerWidth}x${window.innerHeight}`);
    console.log("- Intro already shown:", localStorage.getItem('introShown') ? "Yes" : "No");
  }, []);

  // Misurazione dei tempi di caricamento
  useEffect(() => {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Page fully loaded in ${loadTime.toFixed(2)}ms`);
    });

    return () => {
      window.removeEventListener('load', () => {});
    };
  }, []);

  // Controlla se l'intro è già stato mostrato
  useEffect(() => {
    try {
      console.log("Checking intro state...");
      // For testing purposes, you can uncomment this line
      // localStorage.removeItem('introShown');
      
      const introShown = localStorage.getItem('introShown');
      
      if (introShown) {
        console.log("Intro has already been shown, skipping");
        setShowIntro(false);
        setIntroCompleted(true);
      } else {
        // Prima visita, mostra intro
        console.log("First visit, showing intro");
        setShowIntro(true);
        // Imposta dopo la prima visita
        localStorage.setItem('introShown', 'true');
      }

      // Safety timeout to ensure content shows even if intro fails
      const safetyTimeout = setTimeout(() => {
        if (!introCompleted) {
          console.log("Safety timeout triggered, forcing content display");
          setIntroCompleted(true);
          setShowIntro(false);
        }
        // Ensure the page is marked as loaded
        setPageLoaded(true);
      }, 5000); // Reduced to 5 seconds for testing

      return () => clearTimeout(safetyTimeout);
    } catch (error) {
      console.error("Error in intro logic:", error);
      // In case of any error, skip the intro
      setShowIntro(false);
      setIntroCompleted(true);
      setPageLoaded(true);
      setRenderError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [introCompleted]);

  const handleIntroComplete = () => {
    console.log("Intro animation completed");
    setIntroCompleted(true);
    setShowIntro(false);
    // Ensure page is marked as loaded
    setPageLoaded(true);
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Gestione errori di rendering
  useEffect(() => {
    if (renderError) {
      console.error("Render error detected:", renderError);
      toast.error("Si è verificato un problema durante il caricamento della pagina");
    }
  }, [renderError]);

  // If page is still initializing, show a detailed loading state
  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-xl mb-4">Inizializzazione M1SSION...</div>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  // Backup error UI in caso di problemi di rendering
  if (renderError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="text-2xl font-bold text-red-500 mb-4">Qualcosa è andato storto</div>
        <div className="mb-4 text-center max-w-md">
          Si è verificato un errore durante il caricamento della landing page. 
          Per favore prova a ricaricare la pagina.
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          Ricarica la pagina
        </Button>
        <div className="mt-8 p-4 bg-gray-800 rounded text-xs max-w-lg overflow-auto">
          <pre>{renderError.toString()}</pre>
          <pre>{renderError.stack}</pre>
        </div>
      </div>
    );
  }

  console.log("Rendering main content. Intro completed:", introCompleted, "Show intro:", showIntro);

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {introCompleted && (
        <>
          <Navbar onRegisterClick={handleRegisterClick} />
          <HeroSection onRegisterClick={handleRegisterClick} />
          <PrizeShowcase />
          <HowItWorksSection />
          <FeaturesSection />
          <TestimonialsSection />
          <CTASection onRegisterClick={handleRegisterClick} />
          <LandingFooter />
          <AgeVerificationModal
            open={showAgeVerification}
            onClose={() => setShowAgeVerification(false)}
            onVerified={handleAgeVerified}
          />
        </>
      )}
    </div>
  );
};

export default Index;
