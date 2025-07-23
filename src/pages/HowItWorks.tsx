// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { IdCard } from 'lucide-react';
import LandingHeader from "@/components/landing/LandingHeader";
import LaunchProgressBar from "@/components/landing/LaunchProgressBar";
import PresentationSection from "@/components/presentation/PresentationSection";
import GameExplanationSection from "@/components/landing/GameExplanationSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import HowItWorksSection from "@/components/landing/HowItWorks";
import SubscriptionSection from "@/components/landing/SubscriptionSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import BackgroundParallax from "@/components/ui/background-parallax";
import CarBrandSelection from "@/components/landing/CarBrandSelection";
import PreRegistrationForm from "@/components/landing/PreRegistrationForm";
import { getMissionDeadline } from '@/utils/countdownDate';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const HowItWorks: React.FC = () => {
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const { checkMissionStarted } = useUnifiedAuth();

  useEffect(() => {
    const checkMission = async () => {
      const isStarted = await checkMissionStarted();
      setCountdownCompleted(isStarted);
    };
    checkMission();
  }, [checkMissionStarted]);

  const onRegisterClick = () => {
    const preRegistrationSection = document.getElementById('pre-registration-form');
    if (preRegistrationSection) {
      preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <BackgroundParallax />
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <LandingHeader countdownCompleted={countdownCompleted} />
      
      {/* Launch Progress Bar */}
      <LaunchProgressBar 
        targetDate={getMissionDeadline()}  
        onCountdownComplete={() => {}} // Handled in parent component
      />
      
      {/* Presentation Section */}
      <PresentationSection visible={true} />
      
      {/* NUOVA SEZIONE: Form di pre-registrazione */}
      <PreRegistrationForm countdownCompleted={countdownCompleted} />
      
      {/* Game Explanation Section */}
      <div id="game-explanation">
        <GameExplanationSection />
      </div>
      
      {/* How It Works Section */}
      <HowItWorksSection onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      {/* "Vuoi provarci? Fallo. Ma fallo per vincere." Section */}
      <section className="w-full relative overflow-hidden py-16 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-3xl md:text-5xl font-orbitron text-cyan-400 mb-8 text-center">
            Vuoi provarci? Fallo. Ma fallo per vincere.
          </div>
          
          <CarBrandSelection />
        </div>
      </section>
      
      {/* Newsletter Section */}
      <NewsletterSection countdownCompleted={countdownCompleted} />
      
      {/* Subscription Section CON TITANIUM */}
      <SubscriptionSection countdownCompleted={countdownCompleted} />
      
      <CTASection onRegisterClick={onRegisterClick} countdownCompleted={countdownCompleted} />
      
      {/* KYC Verification Section */}
      <div className="py-12 bg-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4">
            <IdCard className="w-6 h-6 text-purple-400" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Verifica la tua identità
          </h2>
          
          <p className="text-white/70 mb-6">
            Per garantire un'esperienza di gioco sicura e conforme alle normative,
            è necessario completare la verifica dell'identità prima di ricevere premi.
          </p>
          
          <Link to="/kyc">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
              Vai alla verifica identità
            </Button>
          </Link>
        </div>
      </div>
      
      <LandingFooter />
    </>
  );
};

export default HowItWorks;