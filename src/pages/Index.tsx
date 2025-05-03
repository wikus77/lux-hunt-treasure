
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
  // Stato per controllare la visualizzazione dell'intro
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  console.log("Rendering Index component, showIntro:", showIntro, "introCompleted:", introCompleted);

  // Set date for countdown (one month from today)
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  // Controlla se l'intro è già stato mostrato in precedenza
  useEffect(() => {
    console.log("Index component mounted - Checking if intro was shown before");
    
    try {
      // Per forzare l'animazione di intro ogni volta, decommentare questa riga
      // localStorage.removeItem('introShown');
      
      const introShown = localStorage.getItem('introShown');
      console.log("localStorage introShown value:", introShown);
      
      if (introShown === 'true') {
        console.log("Intro was shown before, skipping animation");
        setShowIntro(false);
        setIntroCompleted(true);
      } else {
        // Prima visita, mostra l'intro
        console.log("First viewing, showing intro animation");
        setShowIntro(true);
        // Imposta dopo la prima visita
        localStorage.setItem('introShown', 'true');
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
      // Fallback in caso di errori con localStorage
      setShowIntro(false);
      setIntroCompleted(true);
    }
  }, []);

  const handleIntroComplete = () => {
    console.log("Intro animation completed");
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

  // Renderizzazione di debug per visualizzare lo stato
  console.log("Rendering page with showIntro:", showIntro, "introCompleted:", introCompleted);

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntro && (
        <AnimatePresence>
          <IntroAnimation onComplete={handleIntroComplete} />
        </AnimatePresence>
      )}

      {introCompleted && (
        <>
          <UnifiedHeader />
          <div className="h-[72px] w-full" />
          <LandingHeader />
          <PresentationSection visible={introCompleted} />
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
        </>
      )}
      
      {/* Elemento di fallback se nulla viene mostrato */}
      {!showIntro && !introCompleted && (
        <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
          Caricamento di M1SSION in corso...
        </div>
      )}
    </div>
  );
};

export default Index;
