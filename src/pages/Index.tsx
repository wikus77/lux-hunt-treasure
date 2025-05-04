
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
import CinematicIntro from "@/components/landing/CinematicIntro";

const Index = () => {
  const [showCinematicIntro, setShowCinematicIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Non utilizziamo più localStorage per controllare se mostrare l'intro
  // La cinematica sarà mostrata ogni volta

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

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Cinematic Intro - Mostrato sempre all'ingresso */}
      {showCinematicIntro && (
        <CinematicIntro onComplete={handleCinematicComplete} />
      )}

      {/* Landing Content */}
      {showContent && (
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
