
import React, { useState, useEffect } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import PresentationSection from "@/components/presentation/PresentationSection";
import GameExplanationSection from "@/components/landing/GameExplanationSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import HowItWorks from "@/components/landing/HowItWorks";
import SubscriptionSection from "@/components/landing/SubscriptionSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { UserPlus, Info } from "lucide-react";
import BackgroundParallax from "@/components/ui/background-parallax";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import CarBrandSelection from "@/components/landing/CarBrandSelection";

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
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Assicuriamo che il contenuto sia caricato con una breve animazione
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Verifica se i pulsanti dello store devono essere attivi
  const isActive = new Date() >= new Date("2025-07-19T00:00:00");
  
  // Se il contenuto non è ancora caricato, mostriamo un div vuoto e trasparente
  if (!contentLoaded) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <>
      <BackgroundParallax />
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      {/* Floating Action Buttons - Fixed position */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <Button 
          onClick={() => setShowPrizeDetails(true)}
          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          size="icon"
        >
          <Info className="h-6 w-6" />
          <span className="sr-only">Dettagli premi</span>
        </Button>
        
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
      
      {/* Game Explanation Section */}
      <GameExplanationSection />
      
      {/* How It Works Section */}
      <HowItWorks onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      {/* "Vuoi provarci? Fallo. Ma fallo per vincere." Section */}
      <section className="w-full relative overflow-hidden py-16 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-3xl md:text-5xl font-orbitron text-cyan-400 mb-8 text-center">
            Vuoi provarci? Fallo. Ma fallo per vincere.
          </div>
          
          <CarBrandSelection />
        </div>
      </section>
      
      {/* Presentation Section */}
      <PresentationSection visible={true} />
      
      {/* Newsletter Section */}
      <NewsletterSection countdownCompleted={countdownCompleted} />
      
      {/* Subscription Section */}
      <SubscriptionSection countdownCompleted={countdownCompleted} />
      
      <CTASection onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      {/* App Store & Google Play buttons section */}
      <div className="mt-16 flex flex-col items-center gap-6">
        <div className="text-center text-white text-xl font-semibold">Disponibile su</div>

        <div className="flex gap-4">
          <a
            href={isActive ? "https://apps.apple.com/app/idXXXXXXXXX" : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-opacity duration-300 ${
              isActive ? "opacity-100 cursor-pointer" : "opacity-50 pointer-events-none"
            }`}
          >
            <img
              src="/appstore-button.png"
              alt="Download on the App Store"
              style={{ height: "50px", borderRadius: "10px" }}
            />
          </a>

          <a
            href={isActive ? "https://play.google.com/store/apps/details?id=com.m1ssion.app" : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-opacity duration-300 ${
              isActive ? "opacity-100 cursor-pointer" : "opacity-50 pointer-events-none"
            }`}
          >
            <img
              src="/googleplay-button.png"
              alt="Get it on Google Play"
              style={{ height: "50px", borderRadius: "10px" }}
            />
          </a>
        </div>
      </div>
      
      <LandingFooter />

      {/* Prize Details Modal */}
      <PrizeDetailsModal 
        isOpen={showPrizeDetails} 
        onClose={() => setShowPrizeDetails(false)} 
      />
    </>
  );
};

export default IndexContent;
