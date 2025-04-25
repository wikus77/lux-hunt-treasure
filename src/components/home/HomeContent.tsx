
import { useState } from "react";
import AnimatedIntroSection from "./AnimatedIntroSection";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import FuturePrizesCarousel from "./FuturePrizesCarousel";
import InviteFriendSection from "./InviteFriendSection";
import CountdownBanner from "./CountdownBanner";
import { Button } from "@/components/ui/button";
import { Music, Trophy, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeContent() {
  const [step, setStep] = useState(0); // step: 0=Intro, 1=main page
  const [musicOn, setMusicOn] = useState(false);

  // Advance after intro
  const handleIntroEnd = () => setStep(1);

  return (
    <div className="relative">
      {/* Animated intro first */}
      <AnimatePresence>
        {step === 0 && (
          <AnimatedIntroSection onEnd={handleIntroEnd} />
        )}
      </AnimatePresence>

      {/* Main page content */}
      {step === 1 && (
        <motion.main 
          className="space-y-10" 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Countdown + Classifica + Musica */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 mt-4">
            <CountdownBanner />
            <div className="flex gap-2">
              <Button
                className="neon-border bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg hover:scale-105"
                onClick={() => window.location.href = "/leaderboard"}
              >
                <Trophy className="w-5 h-5 mr-1" /> Classifica LIVE
              </Button>
              {/* Ambient music toggle */}
              <Button
                size="icon"
                className="ml-2 bg-black/70 neon-border text-yellow-300 hover:bg-yellow-400/10"
                aria-label={musicOn ? "Disattiva musica" : "Attiva musica"}
                onClick={() => setMusicOn(v => !v)}
              >
                <Music className={musicOn ? "text-green-400 animate-neon-pulse w-6 h-6" : "text-yellow-300 w-6 h-6"} />
              </Button>
            </div>
          </div>

          {/* EVENTO CORRENTE: auto del mese */}
          <section className="mt-2">
            <h2 className="text-2xl font-orbitron neon-text-cyan mb-4">Missione Corrente</h2>
            <FuturisticCarsCarousel />
          </section>

          {/* MISSIONI FUTURE */}
          <section>
            <h2 className="text-2xl font-orbitron neon-text-magenta mb-4">Prossime Missioni</h2>
            <FuturePrizesCarousel />
          </section>

          {/* MAPPA LIVE (prossimamente) */}
          <section className="flex flex-col items-center py-5">
            <Button
              variant="secondary"
              className="text-white glass-card px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105"
              // attiva live mappa se implementata, ora placeholder
              onClick={() => alert("Mappa LIVE: presto disponibile")}
            >
              <Map className="w-5 h-5" /> Mappa LIVE (prossimamente)
            </Button>
            <span className="mt-2 text-xs text-yellow-200 opacity-70 italic">
              (Sarà visibile chi trova indizi in tempo reale)
            </span>
          </section>

          {/* INVITA UN AMICO */}
          <InviteFriendSection />
        </motion.main>
      )}
    </div>
  );
}
