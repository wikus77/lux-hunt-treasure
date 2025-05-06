
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import PresentationSection from "@/components/presentation/PresentationSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHeader from "@/components/landing/LandingHeader";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import LandingFooter from "@/components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";
import NextEventCountdown from "@/components/landing/NextEventCountdown";
import { SubscriptionSection } from "@/components/landing/SubscriptionSection";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { InviteFriendSection } from "@/components/landing/InviteFriendSection";
import { LaunchProgressBar } from "@/components/landing/LaunchProgressBar";
import { CallToAction } from "@/components/landing/CallToAction";

const Index = () => {
  // Control the intro animation visibility
  const [introCompleted, setIntroCompleted] = useState(true); // Set to true to skip intro by default
  const [showAgeVerification, setShowAgeVerification] = useState(false);
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
          <LandingHeader />
          
          {/* Countdown and Progress Bar */}
          <div className="mb-4 mt-8">
            <NextEventCountdown targetDate={nextEventDate} />
            <LaunchProgressBar />
          </div>
          
          <PresentationSection visible={true} />
          
          {/* Subscription Section */}
          <SubscriptionSection />
          
          {/* CTA Section */}
          <CallToAction />
          
          {/* Newsletter Signup */}
          <NewsletterSignup />
          
          <HowItWorks onRegisterClick={handleRegisterClick} />
          
          {/* Invite Friend Section */}
          <InviteFriendSection />
          
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
