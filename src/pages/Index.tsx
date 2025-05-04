
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
    // Reset the intro animation by clearing localStorage
    localStorage.removeItem('introShown');
    
    // Check if we've shown the intro before
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro) {
      // Skip intro if already seen
      setIntroCompleted(true);
    } else {
      // Initially hide the main content when showing intro
      document.body.style.opacity = "1";
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    document.body.style.visibility = "visible";
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
      {!introCompleted && (
        <LaserRevealIntro onComplete={handleIntroComplete} />
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
