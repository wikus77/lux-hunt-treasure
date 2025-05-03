
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import PresentationSection from "@/components/landing/PresentationSection";
import NextEventCountdown from "@/components/landing/NextEventCountdown";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHeader from "@/components/landing/LandingHeader";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  
  // Set date for countdown
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  useEffect(() => {
    // Ensure content visibility
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
  }, []);

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      <LandingHeader />
      <PresentationSection visible={true} />
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
  );
};

export default Index;
