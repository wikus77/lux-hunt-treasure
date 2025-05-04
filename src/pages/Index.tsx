
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
import CinematicIntro from "@/components/landing/CinematicIntro";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Controlla se l'intro è già stato mostrato
  useEffect(() => {
    // Rimuovi questo commento per testare l'animazione intro
    // localStorage.removeItem('introShown');
    
    // Per test: uncomment to always show the cinematic
    // localStorage.removeItem('cinematicShown');
    
    const introShown = localStorage.getItem('introShown');
    const cinematicShown = localStorage.getItem('cinematicShown');
    
    if (introShown) {
      setShowIntro(false);
      setIntroCompleted(true);
    } else {
      // Prima visita, mostra intro
      setShowIntro(true);
      // Imposta dopo la prima visita
      localStorage.setItem('introShown', 'true');
    }
    
    // Check if cinematic has been shown
    if (cinematicShown) {
      setShowCinematicIntro(false);
    } else {
      setShowCinematicIntro(true);
      localStorage.setItem('cinematicShown', 'true');
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setShowIntro(false);
  };
  
  const handleCinematicComplete = () => {
    setShowCinematicIntro(false);
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      
      {introCompleted && showCinematicIntro && (
        <CinematicIntro onComplete={handleCinematicComplete} />
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
