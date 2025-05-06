
import { useState, useEffect, lazy, Suspense } from "react";
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
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import InviteFriendDialog from "@/components/landing/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Info } from "lucide-react";
import GameExplanationSection from "@/components/landing/GameExplanationSection";
import ParallaxContainer from "@/components/ui/parallax-container";
import DetailsModal from "@/components/landing/DetailsModal";

// Lazy load non-essential components
const SubscriptionSection = lazy(() => import("@/components/landing/SubscriptionSection"));

const Index = () => {
  console.log("Index component rendering");
  
  // Control the intro animation visibility
  const [introCompleted, setIntroCompleted] = useState(true); // Set to true to skip intro by default
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsType, setDetailsType] = useState<'prizes' | 'game' | 'subscription'>('prizes');
  const [detailsTitle, setDetailsTitle] = useState('');
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

    // Check if countdown has already passed
    const now = new Date();
    if (now > nextEventDate) {
      setCountdownCompleted(true);
    }
  }, [nextEventDate]);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    console.log("Intro completed, showing landing page");
    
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
  
  // Function to open details modal
  const openDetailsModal = (type: 'prizes' | 'game' | 'subscription', title: string) => {
    setDetailsType(type);
    setDetailsTitle(title);
    setShowDetailsModal(true);
  };

  // Callback for when countdown completes
  const handleCountdownComplete = () => {
    setCountdownCompleted(true);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {!introCompleted && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <LaserRevealIntro onComplete={handleIntroComplete} />
        </div>
      )}
      
      {introCompleted && (
        <ParallaxContainer>
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
          
          {/* Luxury Cars Section - "Fallo ora, Fallo meglio di tutti" */}
          <div data-parallax="section" data-parallax-speed="0.1">
            <LuxuryCarsSection />
            
            {/* Info Button - Show more details */}
            <div className="flex justify-center pb-8">
              <Button 
                onClick={() => openDetailsModal('prizes', 'Auto di Lusso in Palio')}
                className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] rounded-full"
                data-parallax="element"
                data-parallax-speed="-0.1"
              >
                <Info className="mr-2 h-4 w-4" />
                Scopri di più
              </Button>
            </div>
          </div>
          
          {/* Game Explanation Section - How it works with detailed rules */}
          <div data-parallax="section" data-parallax-speed="0.15">
            <GameExplanationSection />
            
            {/* Info Button - Show game details */}
            <div className="flex justify-center pb-8">
              <Button 
                onClick={() => openDetailsModal('game', 'Come Funziona M1SSION')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-[0_0_15px_rgba(123,46,255,0.5)] rounded-full"
                data-parallax="element"
                data-parallax-speed="-0.1"
              >
                <Info className="mr-2 h-4 w-4" />
                Regole Complete
              </Button>
            </div>
          </div>
          
          {/* Newsletter Section */}
          <NewsletterSection countdownCompleted={countdownCompleted} />
          
          {/* How It Works */}
          <HowItWorks onRegisterClick={handleRegisterClick} countdownCompleted={countdownCompleted} />
          
          {/* Subscription Section */}
          <Suspense fallback={<div className="h-[500px] flex items-center justify-center text-white/50">Caricamento abbonamenti...</div>}>
            <SubscriptionSection countdownCompleted={countdownCompleted} />
          </Suspense>
          
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
          
          <DetailsModal
            open={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            type={detailsType}
            title={detailsTitle}
          />
        </ParallaxContainer>
      )}
    </div>
  );
};

export default Index;
