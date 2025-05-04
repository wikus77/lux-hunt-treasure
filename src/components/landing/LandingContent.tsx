
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
  // Garantisce visibilità immediata con molteplici fallback
  useEffect(() => {
    console.log("LandingContent: forzatura visibilità diretta");
    
    // Forza visibilità con diverse tecniche
    const forceVisibility = () => {
      const element = document.querySelector('.landing-content-wrapper');
      if (element) {
        (element as HTMLElement).style.display = "block";
        (element as HTMLElement).style.visibility = "visible";
        (element as HTMLElement).style.opacity = "1";
        console.log("LandingContent: visibilità forzata con successo");
      }
      
      // Forza anche visibilità dell'elemento principale
      document.body.style.backgroundColor = "#000";
      document.body.style.visibility = "visible";
      document.body.style.opacity = "1";
    };
    
    // Esegui subito e ripeti dopo un breve delay per garantire visibilità
    forceVisibility();
    const timer = setTimeout(forceVisibility, 10);
    const timer2 = setTimeout(forceVisibility, 100);
    const timer3 = setTimeout(forceVisibility, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div 
      className="landing-content-wrapper landing-content"
      style={{
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        backgroundColor: "#000"
      }}
    >
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
