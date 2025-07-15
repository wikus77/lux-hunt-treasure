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
  
  // Fix per il problema di ricarica della pagina:
  // Pulisci la cache di localStorage per forzare il ricaricamento dei contenuti
  useEffect(() => {
    // Rimuovi i flag che potrebbero impedire il caricamento completo
    if (typeof window !== 'undefined') {
      try {
        // Rimuove solo i flag relativi all'intro e non altri dati importanti
        localStorage.removeItem("skipIntro");
        localStorage.removeItem("introStep");
        localStorage.removeItem("introShown");
        
        // Non rimuovere informazioni di autenticazione o altre preferenze utente
        console.log("Cache di navigazione pulita per garantire il corretto caricamento");
      } catch (error) {
        console.error("Errore nell'accesso a localStorage:", error);
      }
    }
  }, []);
  
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
      
      {/* Presentation Section */}
      <PresentationSection visible={true} />
      
      {/* NUOVA SEZIONE: Form di pre-registrazione */}
      <PreRegistrationForm countdownCompleted={countdownCompleted} />
      
      {/* Game Explanation Section */}
      <div id="game-explanation">
        <GameExplanationSection />
      </div>
      
      {/* How It Works Section */}
      <HowItWorks onRegisterClick={() => {
        const preRegistrationSection = document.getElementById('pre-registration-form');
        if (preRegistrationSection) {
          preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          onRegisterClick();
        }
      }} countdownCompleted={countdownCompleted} />
      
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
      
      {/* Subscription Section */}
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
      
      {/* Manteniamo la sezione corretta nel footer e rimuoviamo la sezione duplicata qui */}
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
