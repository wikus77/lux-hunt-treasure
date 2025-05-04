
import React, { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PrizeShowcase from "@/components/landing/PrizeShowcase";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";

interface LandingContentProps {
  onRegisterClick: () => void;
  showAgeVerification: boolean;
  onCloseAgeVerification: () => void;
  onAgeVerified: () => void;
  visible: boolean;
}

const LandingContent: React.FC<LandingContentProps> = ({
  onRegisterClick,
  showAgeVerification,
  onCloseAgeVerification,
  onAgeVerified,
  visible
}) => {
  // Garantisce che il contenuto sia visibile indipendentemente dall'animazione
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.querySelector('.landing-content-wrapper');
      if (element) {
        (element as HTMLElement).style.opacity = '1';
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`landing-content-wrapper landing-content transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar onRegisterClick={onRegisterClick} />
      <HeroSection onRegisterClick={onRegisterClick} />
      <PrizeShowcase />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onRegisterClick={onRegisterClick} />
      <LandingFooter />
      <AgeVerificationModal
        open={showAgeVerification}
        onClose={onCloseAgeVerification}
        onVerified={onAgeVerified}
      />
    </div>
  );
};

export default LandingContent;
