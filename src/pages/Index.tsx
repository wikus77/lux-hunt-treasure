
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
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
  const [showIntro, setShowIntro] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  
  // Set date for countdown
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  useEffect(() => {
    // Sistema semplificato di gestione dell'intro
    const introShown = localStorage.getItem('introShown') === 'true';
    const wasRefreshed = sessionStorage.getItem('wasRefreshed') === 'true';
    
    // Se è un refresh o l'intro è già stato mostrato, saltalo
    if (wasRefreshed || introShown) {
      setShowIntro(false);
    } else {
      setShowIntro(true);
    }
    
    // Garantisci sempre la visibilità
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.display = 'block';
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
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
      {/* Intro animation */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div 
        className={`transition-opacity duration-500 ${showIntro ? "opacity-0" : "opacity-100"}`}
        style={{ visibility: showIntro ? 'hidden' : 'visible' }}
      >
        <UnifiedHeader />
        <div className="h-[72px] w-full" />
        <LandingHeader />
        <PresentationSection visible={!showIntro} />
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
      </div>
    </div>
  );
};

export default Index;
