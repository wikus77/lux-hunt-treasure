
import { useState, useEffect } from "react";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import FutureMissionsCarousel from "./FutureMissionsCarousel";
import { Button } from "@/components/ui/button";
import { Trophy, Map, Music } from "lucide-react";
import { motion } from "framer-motion";
import CurrentEventSection from "./CurrentEventSection";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { AnimatedSection } from "@/components/ui/animated-section";
import NeonSplitCountdown from "./NeonSplitCountdown";

export default function HomeContent() {
  console.log("[HomeContent] COMPONENT MOUNTED!");
  const [musicOn, setMusicOn] = useState(false);

  // Section reveal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="relative">
      <motion.main 
        className="space-y-16" 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        data-scroll-section
      >
        {/* Countdown Timer Section */}
        <AnimatedSection className="flex flex-col items-center justify-center pt-2" delay={0.1}>
          <NeonSplitCountdown />
        </AnimatedSection>
        
        {/* Intro Text Section */}
        <AnimatedSection className="flex flex-col items-center justify-center fade-in mb-2 mt-0" delay={0.3}>
          <motion.div 
            className="text-center max-w-3xl mx-auto px-4 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-3">
              Benvenuto in M1SSION
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Scopri eventi esclusivi, cerca indizi misteriosi e vinci premi incredibili.
              Unisciti alla community per vivere esperienze uniche con auto di lusso.
            </p>
          </motion.div>
        </AnimatedSection>
        
        {/* Mission Section with Parallax */}
        <AnimatedSection className="relative mb-6" delay={0.5}>
          <div className="absolute inset-0 -z-10 opacity-20 overflow-hidden rounded-xl" data-scroll data-scroll-speed="-0.2">
            <ParallaxImage 
              src="/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png"
              alt="Background texture"
              className="w-full h-full overflow-hidden rounded-xl"
              imageClassName="w-full h-full object-cover opacity-30"
              speed={0.3}
            />
          </div>
          <div className="glass-card p-6 rounded-xl text-center">
            <h3 className="text-xl font-semibold text-yellow-200 mb-3">La tua prossima avventura</h3>
            <p className="text-white/80">
              Preparati a scoprire indizi, trovare la posizione segreta e vincere un'auto da sogno!
            </p>
          </div>
        </AnimatedSection>
        
        {/* Action Buttons - with Magnetic effect */}
        <AnimatedSection className="flex flex-row items-center justify-center gap-4 px-2 mt-2" delay={0.7}>
          <MagneticButton
            className="neon-border bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg hover:scale-105 py-2 px-4 rounded-full"
            onClick={() => window.location.href = "/leaderboard"}
            strength={20}
          >
            <Trophy className="w-5 h-5 mr-1 inline" /> Classifica LIVE
          </MagneticButton>
          
          <MagneticButton
            className="ml-2 bg-black/70 neon-border text-yellow-300 hover:bg-yellow-400/10 w-10 h-10 flex items-center justify-center rounded-full"
            aria-label={musicOn ? "Disattiva musica" : "Attiva musica"}
            onClick={() => setMusicOn(v => !v)}
            strength={30}
          >
            <Music className={musicOn ? "text-green-400 animate-neon-pulse w-6 h-6" : "text-yellow-300 w-6 h-6"} />
          </MagneticButton>
        </AnimatedSection>
        
        {/* Current Event Section with reveal animation */}
        <div data-scroll data-scroll-speed="0.1">
          <CurrentEventSection />
        </div>
        
        {/* Future Missions with staggered fade-in */}
        <AnimatedSection delay={0.5}>
          <div className="relative" data-scroll data-scroll-speed="0.15">
            <FutureMissionsCarousel />
          </div>
        </AnimatedSection>
        
        {/* Map Button Section */}
        <AnimatedSection className="flex flex-col items-center py-8 mb-8" delay={0.6}>
          <MagneticButton
            className="text-white glass-card px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 neon-border"
            onClick={() => alert("Mappa LIVE: presto disponibile")}
            strength={25}
          >
            <Map className="w-5 h-5" /> Mappa LIVE (prossimamente)
          </MagneticButton>
          <motion.span 
            className="mt-2 text-xs text-yellow-200 opacity-70 italic"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            (Sarà visibile chi trova indizi in tempo reale)
          </motion.span>
        </AnimatedSection>
      </motion.main>
    </div>
  );
}
