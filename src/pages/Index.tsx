
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
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();

  // Controlla se l'intro è già stato mostrato
  useEffect(() => {
    try {
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
      }, 10000);

      return () => clearTimeout(safetyTimeout);
    } catch (error) {
      console.error("Error in intro logic:", error);
      // In case of any error, skip the intro
      setShowIntro(false);
      setIntroCompleted(true);
    } finally {
      // Ensure the page is marked as loaded
      setPageLoaded(true);
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

  // If page is still initializing, show a minimal loading state
  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="animate-pulse">Caricamento...</div>
      </div>
    );
  }

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
