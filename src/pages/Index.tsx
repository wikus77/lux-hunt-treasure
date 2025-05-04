
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

const Index = () => {
  // Skip the intro animation entirely
  const [introCompleted, setIntroCompleted] = useState(true);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Get target date from utility function
  const nextEventDate = getMissionDeadline();

  // Set loaded as true immediately and ensure page is visible
  useEffect(() => {
    // Force visibility of main content
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
    
    // Set localStorage to skip intro on future visits too
    localStorage.setItem('introShown', 'true');
  }, []);

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden" style={{ opacity: 1, visibility: "visible" }}>
      <>
        <UnifiedHeader />
        <div className="h-[72px] w-full" />
        <LandingHeader />
        <PresentationSection visible={true} />
        {/* Removed NextEventCountdown and placed CTASection here */}
        <CTASection onRegisterClick={handleRegisterClick} />
        <HowItWorks onRegisterClick={handleRegisterClick} />
        <LuxuryCarsSection />
        {/* Removed duplicate CTASection that was here before */}
        <LandingFooter />
        <AgeVerificationModal
          open={showAgeVerification}
          onClose={() => setShowAgeVerification(false)}
          onVerified={handleAgeVerified}
        />
      </>
    </div>
  );
};

export default Index;
