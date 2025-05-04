
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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
  const [showIntro, setShowIntro] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  // Set date for countdown (one month from today)
  const nextEventDate = new Date();
  nextEventDate.setMonth(nextEventDate.getMonth() + 1);

  // Check if intro was shown before
  useEffect(() => {
    // Uncomment this line to test the intro animation again
    // localStorage.removeItem('introShown');
    
    const introShown = localStorage.getItem('introShown');
    if (introShown) {
      setShowIntro(false);
      setIntroCompleted(true);
    } else {
      // First viewing, show intro
      setShowIntro(true);
      // Set after first viewing
      localStorage.setItem('introShown', 'true');
    }
  }, []);

  const handleIntroComplete = () => {
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

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {introCompleted && (
        <>
          <UnifiedHeader />
          <div className="h-[72px] w-full" />
          <LandingHeader />
          <PresentationSection visible={introCompleted} />
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
        </>
      )}
    </div>
  );
};

export default Index;
