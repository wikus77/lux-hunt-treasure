
import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import PresentationSection from "@/components/presentation/PresentationSection";
import LuxuryCarsSection from "@/components/landing/LuxuryCarsSection";
import GameExplanationSection from "@/components/landing/GameExplanationSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import HowItWorks from "@/components/landing/HowItWorks";
import SubscriptionSection from "@/components/landing/SubscriptionSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import BackgroundParticles from "@/components/ui/background-particles";

interface IndexContentProps {
  countdownCompleted: boolean;
  onRegisterClick: () => void;
  openInviteFriend: () => void;
}

const IndexContent = ({ 
  countdownCompleted, 
  onRegisterClick, 
  openInviteFriend 
}: IndexContentProps) => {
  return (
    <>
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
        targetDate={new Date(2025, 5, 19, 12, 0, 0)}  
        onCountdownComplete={() => {}} // Handled in parent component
      />
      
      {/* Presentation Section */}
      <PresentationSection visible={true} />
      
      {/* Luxury Cars Section */}
      <LuxuryCarsSection />
      
      {/* Game Explanation Section */}
      <GameExplanationSection />
      
      {/* Newsletter Section */}
      <NewsletterSection countdownCompleted={countdownCompleted} />
      
      <HowItWorks onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      {/* Subscription Section */}
      <SubscriptionSection countdownCompleted={countdownCompleted} />
      
      <CTASection onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      <LandingFooter />
    </>
  );
};

export default IndexContent;
