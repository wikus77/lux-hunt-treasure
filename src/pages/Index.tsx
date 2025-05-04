
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IntroAnimation from "@/components/intro/IntroAnimation";
import LandingContent from "@/components/landing/LandingContent";
import ErrorFallback from "@/components/errors/ErrorFallback";
import { useIntroAnimation } from "@/hooks/useIntroAnimation";

const Index = () => {
  // Updated comment to verify changes are working
  const { showIntro, introCompleted, handleIntroComplete, renderError } = useIntroAnimation();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();
  
  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Recovery in case of rendering errors
  if (renderError) {
    return <ErrorFallback />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntro && !introCompleted && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* MAIN CONTENT: Always visible with opacity control */}
      <LandingContent 
        onRegisterClick={handleRegisterClick}
        showAgeVerification={showAgeVerification}
        onCloseAgeVerification={() => setShowAgeVerification(false)}
        onAgeVerified={handleAgeVerified}
        visible={!showIntro || introCompleted}
      />
    </div>
  );
};

export default Index;
