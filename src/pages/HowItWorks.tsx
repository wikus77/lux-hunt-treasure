
import React from "react";
import { motion } from "framer-motion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import BackgroundParticles from "@/components/ui/background-particles";
import HowItWorksHeader from "@/components/how-it-works/HowItWorksHeader";
import GameConcept from "@/components/how-it-works/GameConcept";
import HowToPlay from "@/components/how-it-works/HowToPlay";
import GameRules from "@/components/how-it-works/GameRules";
import PrizesSection from "@/components/how-it-works/PrizesSection";
import FaqSection from "@/components/how-it-works/FaqSection";
import CallToActionSection from "@/components/how-it-works/CallToActionSection";

const HowItWorks = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      <UnifiedHeader />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]"></div>
      
      {/* Background effects */}
      <BackgroundParticles count={20} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06071b]/80 via-transparent to-[#06071b]/80 z-[-1]"></div>
      
      {/* Hero section */}
      <HowItWorksHeader />
      
      {/* Main content */}
      <motion.section 
        className="py-12 px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          {/* Game concept */}
          <GameConcept variants={itemVariants} />
          
          {/* How to play */}
          <HowToPlay variants={itemVariants} />
          
          {/* Rules */}
          <GameRules variants={itemVariants} />
          
          {/* Prizes */}
          <PrizesSection variants={itemVariants} />
          
          {/* FAQ */}
          <FaqSection variants={itemVariants} />
        </div>
      </motion.section>
      
      {/* Call to Action */}
      <CallToActionSection />
      
      <LandingFooter />
    </div>
  );
};

export default HowItWorks;
