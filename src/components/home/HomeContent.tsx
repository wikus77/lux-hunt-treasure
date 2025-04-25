
import { useState, useEffect } from "react";
import AnimatedIntroSection from "./AnimatedIntroSection";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import FuturePrizesCarousel from "./FuturePrizesCarousel";
import InviteFriendSection from "./InviteFriendSection";
import CountdownBanner from "./CountdownBanner";
import { Button } from "@/components/ui/button";
import { Music, Trophy, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeContent() {
  // Usa step baseline su localStorage, simile a landing (slash route)
  const [step, setStep] = useState<number>(() => {
    const introAlready = typeof window !== "undefined" && localStorage.getItem("homeIntroShown") === "true";
    console.log("[HomeContent] INIT step – homeIntroShown", introAlready);
    return introAlready ? 1 : 0;
  });
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    console.log("[HomeContent] useEffect: step value", step);
    // Solo dopo aver visto l'intro, setta la flag in localStorage
    if (step === 1 && typeof window !== "undefined") {
      localStorage.setItem("homeIntroShown", "true");
      console.log("[HomeContent] Set homeIntroShown=true in localStorage");
    }
  }, [step]);

  // Avanza dopo intro
  const handleIntroEnd = () => {
    console.log("[HomeContent] handleIntroEnd fired");
    setStep(1);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {step === 0 && (
          <AnimatedIntroSection
            onEnd={handleIntroEnd}
          />
        )}
      </AnimatePresence>

      {/* Main page content - mostra tutto se step 1 */}
      {step === 1 && (
        <motion.main 
          className="space-y-10" 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 mt-4">
            <CountdownBanner />
            <div className="flex gap-2">
              <Button
                className="neon-border bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg hover:scale-105"
                onClick={() => window.location.href = "/leaderboard"}
              >
                <Trophy className="w-5 h-5 mr-1" /> Classifica LIVE
              </Button>
              {/* Ambient music toggle (resta extra, ma visibile) */}
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
          <section className="mt-2">
            <h2 className="text-2xl font-orbitron neon-text-cyan mb-4">Missione Corrente</h2>
            <FuturisticCarsCarousel />
          </section>
          <section>
            <h2 className="text-2xl font-orbitron neon-text-magenta mb-4">Prossime Missioni</h2>
            <FuturePrizesCarousel />
          </section>
          <section className="flex flex-col items-center py-5">
            <Button
              variant="secondary"
              className="text-white glass-card px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105"
              onClick={() => alert("Mappa LIVE: presto disponibile")}
            >
              <Map className="w-5 h-5" /> Mappa LIVE (prossimamente)
            </Button>
            <span className="mt-2 text-xs text-yellow-200 opacity-70 italic">
              (Sarà visibile chi trova indizi in tempo reale)
            </span>
          </section>
          <InviteFriendSection />
        </motion.main>
      )}
    </div>
  );
}
