
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import PresentationSection from "@/components/landing/PresentationSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHeader from "@/components/landing/LandingHeader";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import BlackHoleRevealIntro from "@/components/intro/BlackHoleRevealIntro";

const Index = () => {
  // Control the intro animation visibility
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Check if we should show the intro animation
  useEffect(() => {
    // Verifica se abbiamo mostrato l'intro prima
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro) {
      // Skip intro if already seen
      setIntroCompleted(true);
    } else {
      // Preparazione per l'animazione
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    
    // Restore scrolling
    document.body.style.overflow = "auto";
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Forza la visualizzazione dell'animazione per debugging
  // Rimuovi questa riga una volta che funziona tutto
  // const introCompleted = false;

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {!introCompleted && (
        <div className="fixed inset-0 z-[9999]">
          <BlackHoleRevealIntro onComplete={handleIntroComplete} />
        </div>
      )}
      
      {introCompleted && (
        <>
          <UnifiedHeader />
          <div className="h-[72px] w-full" />
          <LandingHeader />
          <PresentationSection visible={true} />
          <CTASection onRegisterClick={handleRegisterClick} />
          <HowItWorks onRegisterClick={handleRegisterClick} />
          <LuxuryCarsSection />
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
