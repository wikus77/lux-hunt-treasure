
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Controlla le animazioni da mostrare all'avvio
  useEffect(() => {
    const introShown = localStorage.getItem('introShown') === 'true';
    const cinematicShown = localStorage.getItem('cinematicShown') === 'true';
    
    // Determina cosa mostrare all'utente
    if (!introShown) {
      // Prima visita - mostra intro iniziale
      setShowIntro(true);
      localStorage.setItem('introShown', 'true');
    } else if (!cinematicShown) {
      // Intro già vista ma cinematic no - mostra solo cinematic
      setIntroCompleted(true);
      setShowCinematicIntro(true);
      localStorage.setItem('cinematicShown', 'true');
    } else {
      // Entrambe già viste - mostra contenuto landing
      setIntroCompleted(true);
      setShowContent(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroCompleted(true);
    setShowCinematicIntro(true);
  };
  
  const handleCinematicComplete = () => {
    setShowCinematicIntro(false);
    setShowContent(true);
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Per debugging
  const resetAnimations = () => {
    localStorage.removeItem('introShown');
    localStorage.removeItem('cinematicShown');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Intro Animation */}
      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      
      {/* Cinematic Intro */}
      {introCompleted && showCinematicIntro && (
        <CinematicIntro onComplete={handleCinematicComplete} />
      )}

      {/* Landing Content */}
      {introCompleted && showContent && (
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
      
      {/* Pulsante di debug - rimuovi per produzione */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={resetAnimations}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-50 hover:opacity-100 z-50"
        >
          Reset Animations
        </button>
      )}
    </div>
  );
};

export default Index;
