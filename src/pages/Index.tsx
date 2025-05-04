
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
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";

const Index = () => {
  // Control the intro animation visibility
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Check if we should show the intro animation
  useEffect(() => {
    // Per test e debug, forziamo l'animazione
    const forceIntroAnimation = true; // Cambia in false per vedere il comportamento normale
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro && !forceIntroAnimation) {
      // Skip intro if already seen
      console.log("Intro già mostrato, saltiamo...");
      setIntroCompleted(true);
    } else {
      // Preparazione per l'animazione
      console.log("Preparazione intro animation...");
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    console.log("Intro completato, mostriamo la landing page");
    
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

  console.log("Index rendering, introCompleted:", introCompleted);

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {!introCompleted && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <LaserRevealIntro onComplete={handleIntroComplete} />
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
