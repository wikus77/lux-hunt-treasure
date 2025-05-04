
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
  // SOLUZIONE DI EMERGENZA: Sempre mostrare il contenuto principale dopo un breve timeout
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  // SUPER FALLBACK: Assicuriamoci che il contenuto si carichi sempre
  useEffect(() => {
    // Inizializzazione sicura: mostra sempre il contenuto dopo un breve ritardo
    const forcedTimeout = setTimeout(() => {
      console.log("FALLBACK FORZATO: Attivazione visualizzazione contenuto");
      setIntroCompleted(true);
      setShowIntro(false);
    }, 1000); // Molto breve, 1 secondo
    
    try {
      const introShown = localStorage.getItem('introShown');
      
      if (introShown) {
        console.log("Intro già mostrato in precedenza, lo saltiamo");
        setShowIntro(false);
        setIntroCompleted(true);
      } else {
        // Prima visita, mostra intro
        console.log("Prima visita, mostriamo intro");
        setShowIntro(true);
        localStorage.setItem('introShown', 'true');
      }
    } catch (error) {
      console.error("Errore nel controllo intro:", error);
      // In caso di errore, saltiamo l'intro e mostriamo il contenuto
      setShowIntro(false);
      setIntroCompleted(true);
    }
    
    return () => clearTimeout(forcedTimeout);
  }, []);

  const handleIntroComplete = () => {
    console.log("Animazione intro completata");
    setIntroCompleted(true);
    setShowIntro(false);
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Recupero di emergenza in caso di errori di rendering
  if (renderError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="text-2xl font-bold text-red-500 mb-4">Qualcosa è andato storto</div>
        <div className="mb-6 text-center max-w-md">
          Si è verificato un errore durante il caricamento della landing page.
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          Ricarica la pagina
        </Button>
      </div>
    );
  }

  // IMPORTANTE: Sempre mostrare il contenuto principale anche se l'intro è attivo
  // Questo previene la schermata bianca
  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntro && !introCompleted && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* CONTENUTO PRINCIPALE: Sempre visibile */}
      <div className={`transition-opacity duration-500 ${showIntro && !introCompleted ? 'opacity-0' : 'opacity-100'}`}>
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
      </div>
    </div>
  );
};

export default Index;
