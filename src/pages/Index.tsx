
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import PresentationSection from "@/components/presentation/PresentationSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHeader from "@/components/landing/LandingHeader";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";
import NewsletterSection from "@/components/landing/NewsletterSection";
import SubscriptionSection from "@/components/landing/SubscriptionSection";
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import InviteFriendDialog from "@/components/landing/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import GameExplanationSection from "@/components/landing/GameExplanationSection";
import ParallaxContainer from "@/components/ui/parallax-container";
import IntroOverlay from "@/components/intro/IntroOverlay";
import BackgroundParticles from "@/components/ui/background-particles";

const Index = () => {
  console.log("Index component rendering");
  
  // Control the intro animation visibility
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Add a useEffect to mark when the page is fully loaded
  useEffect(() => {
    if (document.readyState === 'complete') {
      console.log("Page already loaded");
      setPageLoaded(true);
    } else {
      console.log("Setting up load event listener");
      const handleLoad = () => {
        console.log("Page fully loaded");
        setPageLoaded(true);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
  
  // Check if we should show the intro animation
  useEffect(() => {
    if (!pageLoaded) return;
    
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro) {
      // Skip intro if already seen
      console.log("Intro already shown, skipping...");
      setShowIntroOverlay(false);
      setIntroCompleted(true);
      document.body.style.overflow = "auto"; // Enable scrolling
    } else {
      // Preparation for intro animation
      console.log("Preparing intro animation...");
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }

    // Check if countdown has already passed
    const now = new Date();
    if (now > nextEventDate) {
      setCountdownCompleted(true);
    }
  }, [nextEventDate, pageLoaded]);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    console.log("Intro completed, showing landing page");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
  };

  const handleOverlayComplete = () => {
    console.log("Overlay complete callback fired");
    setShowIntroOverlay(false);
    setIntroCompleted(true);
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    // Restore scrolling
    document.body.style.overflow = "auto";
  };

  const handleRegisterClick = () => {
    if (countdownCompleted) {
      setShowAgeVerification(true);
    } else {
      console.log("Registration is disabled until countdown completes");
    }
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Function to handle invite friend button click
  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  // Callback for when countdown completes
  const handleCountdownComplete = () => {
    setCountdownCompleted(true);
  };

  console.log("Render state:", { 
    showIntroOverlay, 
    introCompleted, 
    pageLoaded 
  });

  // Show a loading state if page is not fully loaded yet
  if (!pageLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="loading-spinner text-center">
          <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {showIntroOverlay && (
        <IntroOverlay onComplete={handleOverlayComplete} />
      )}
      
      {!introCompleted && !showIntroOverlay && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <LaserRevealIntro onComplete={handleIntroComplete} />
        </div>
      )}
      
      {introCompleted && (
        <ParallaxContainer>
          <BackgroundParticles count={20} />
          <UnifiedHeader />
          <div className="h-[72px] w-full" />
          
          {/* Invite Friend Button - Fixed position */}
          <div className="fixed bottom-8 right-8 z-40">
            <Button 
              onClick={openInviteFriend}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              size="icon"
            >
              <UserPlus className="h-6 w-6" />
              <span className="sr-only">Invita un amico</span>
            </Button>
          </div>
          
          <LandingHeader countdownCompleted={countdownCompleted} />
          
          {/* Launch Progress Bar */}
          <LaunchProgressBar 
            targetDate={nextEventDate} 
            onCountdownComplete={handleCountdownComplete}
          />
          
          {/* Presentation Section */}
          <PresentationSection visible={true} />
          
          {/* Luxury Cars Section - Renamed to "Fallo ora, Fallo meglio di tutti" */}
          <LuxuryCarsSection />
          
          {/* Game Explanation Section - How it works with detailed rules */}
          <GameExplanationSection />
          
          {/* Newsletter Section */}
          <NewsletterSection countdownCompleted={countdownCompleted} />
          
          <HowItWorks onRegisterClick={handleRegisterClick} countdownCompleted={countdownCompleted} />
          
          {/* Subscription Section */}
          <SubscriptionSection countdownCompleted={countdownCompleted} />
          
          <CTASection onRegisterClick={handleRegisterClick} countdownCompleted={countdownCompleted} />
          
          <LandingFooter />
          
          {/* Modals */}
          <AgeVerificationModal
            open={showAgeVerification}
            onClose={() => setShowAgeVerification(false)}
            onVerified={handleAgeVerified}
          />
          
          <InviteFriendDialog
            open={showInviteFriend}
            onClose={() => setShowInviteFriend(false)}
          />
        </ParallaxContainer>
      )}
    </div>
  );
};

export default Index;
