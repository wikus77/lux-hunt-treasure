
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
import FeaturesSection from "@/components/landing/FeaturesSection";
import InviteFriendDialog from "@/components/landing/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const Index = () => {
  // Control the intro animation visibility
  const [introCompleted, setIntroCompleted] = useState(true); // Set to true to skip intro by default
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Check if we should show the intro animation
  useEffect(() => {
    // For testing, we'll disable the intro animation
    const forceIntroAnimation = false; // Changed to false to skip the intro
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro || !forceIntroAnimation) {
      // Skip intro if already seen
      console.log("Intro already shown, skipping...");
      setIntroCompleted(true);
      document.body.style.overflow = "auto"; // Enable scrolling
    } else {
      // Preparation for intro animation
      console.log("Preparing intro animation...");
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    console.log("Intro completed, showing landing page");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
  };

  const handleRegisterClick = () => {
    setShowAgeVerification(true);
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  console.log("Index rendering, introCompleted:", introCompleted);

  // Function to handle invite friend button click
  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {!introCompleted && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <LaserRevealIntro onComplete={handleIntroComplete} />
        </div>
      )}
      
      {introCompleted && (
        <>
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
          
          <LandingHeader />
          
          {/* New Launch Progress Bar */}
          <LaunchProgressBar targetDate={nextEventDate} />
          
          {/* Features Section */}
          <FeaturesSection />
          
          <PresentationSection visible={true} />
          
          {/* Newsletter Section */}
          <NewsletterSection />
          
          <HowItWorks onRegisterClick={handleRegisterClick} />
          
          {/* Subscription Section */}
          <SubscriptionSection />
          
          <LuxuryCarsSection />
          
          <CTASection onRegisterClick={handleRegisterClick} />
          
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
        </>
      )}
    </div>
  );
};

export default Index;
