
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { UserPlus, Info, IdCard } from "lucide-react";
import BackgroundParallax from "@/components/ui/background-parallax";
import PrizeDetailsModal from "@/components/landing/PrizeDetailsModal";
import CarBrandSelection from "@/components/landing/CarBrandSelection";
import KYCSection from "@/components/kyc/KYCSection";
import PreRegistrationForm from "@/components/landing/PreRegistrationForm";
import "@/styles/mobile-optimizations.css";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("skipIntro");
        localStorage.removeItem("introStep");
        localStorage.removeItem("introShown");
        
        console.log("Cache di navigazione pulita per garantire il corretto caricamento");
      } catch (error) {
        console.error("Errore nell'accesso a localStorage:", error);
      }
    }
  }, []);
  
  if (!contentLoaded) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <div className="mobile-scroll retina-optimized">
      <BackgroundParallax />
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      {/* Floating Action Buttons - Ottimizzati per mobile */}
      <div className="fixed bottom-8 right-4 z-40 flex flex-col gap-4">
        <Button 
          onClick={() => setShowPrizeDetails(true)}
          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 mobile-touch-target"
          size="icon"
        >
          <Info className="h-6 w-6" />
          <span className="sr-only">Dettagli premi</span>
        </Button>
        
        <Button 
          onClick={openInviteFriend}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 mobile-touch-target"
          size="icon"
        >
          <UserPlus className="h-6 w-6" />
          <span className="sr-only">Invita un amico</span>
        </Button>
      </div>
      
      <div className="mobile-container">
        <LandingHeader countdownCompleted={countdownCompleted} />
        
        <LaunchProgressBar 
          targetDate={new Date(2025, 5, 19, 12, 0, 0)}  
          onCountdownComplete={() => {}}
        />
        
        <PresentationSection visible={true} />
        
        <PreRegistrationForm />
        
        <div id="game-explanation">
          <GameExplanationSection />
        </div>
        
        <HowItWorks onRegisterClick={() => {
          const preRegistrationSection = document.getElementById('pre-registration-form');
          if (preRegistrationSection) {
            preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            onRegisterClick();
          }
        }} countdownCompleted={countdownCompleted} />
        
        <section className="w-full relative overflow-hidden py-16 bg-black">
          <div className="max-w-6xl mx-auto mobile-container">
            <div className="mobile-title text-3xl md:text-5xl font-orbitron text-cyan-400 mb-8 text-center">
              Vuoi provarci? Fallo. Ma fallo per vincere.
            </div>
            
            <CarBrandSelection />
          </div>
        </section>
        
        <NewsletterSection countdownCompleted={countdownCompleted} />
        
        <SubscriptionSection countdownCompleted={countdownCompleted} />
        
        <CTASection onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
        
        <div className="py-12 bg-black">
          <div className="max-w-3xl mx-auto px-4 text-center mobile-container">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4">
              <IdCard className="w-6 h-6 text-purple-400" />
            </div>
            
            <h2 className="mobile-title text-2xl md:text-3xl font-bold text-white mb-3">
              Verifica la tua identità
            </h2>
            
            <p className="text-white/70 mb-6 mobile-text">
              Per garantire un'esperienza di gioco sicura e conforme alle normative,
              è necessario completare la verifica dell'identità prima di ricevere premi.
            </p>
            
            <Link to="/kyc">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 mobile-button mobile-touch-target">
                Vai alla verifica identità
              </Button>
            </Link>
          </div>
        </div>
        
        <LandingFooter />
      </div>

      <PrizeDetailsModal 
        isOpen={showPrizeDetails} 
        onClose={() => setShowPrizeDetails(false)} 
      />
    </div>
  );
};

export default IndexContent;
