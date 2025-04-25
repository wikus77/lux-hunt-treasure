
import { useState } from 'react';
import HomeIntro from './HomeIntro';
import EventCarousel from './EventCarousel';
import FutureMissionsCarousel from './FutureMissionsCarousel';
import InviteFriendSection from './InviteFriendSection';
import CountdownTimer from './CountdownTimer';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Map, Music } from "lucide-react";

export default function HomeContent() {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  // Per musica ambiente/placeholder, show/hide toggle
  const [isMusicOn, setIsMusicOn] = useState(false);

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {showIntro && (
          <HomeIntro onEnd={() => setShowIntro(false)} />
        )}
      </AnimatePresence>
      {!showIntro && (
        <>
          {/* SEZIONE COUNTDOWN MISSIONE CORRENTE */}
          <motion.section 
            className="py-6 flex flex-col sm:flex-row items-center justify-between w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl font-orbitron neon-text-cyan mb-4 sm:mb-0">Missione Corrente</h2>
            <div className="flex items-center gap-6">
              <div className="bg-[#181641] neon-border px-8 py-3 rounded-xl shadow-lg">
                <span className="block text-xs text-white/60">Tempo rimasto:</span>
                <CountdownTimer />
              </div>
              {/* Pulsante rapido leaderboard */}
              <Button
                className="ml-2 neon-border bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg text-black hover:scale-105"
                onClick={() => navigate("/leaderboard")}
                variant="accent"
              >
                <Trophy className="w-5 h-5" /> Classifica LIVE
              </Button>
            </div>
            {/* Musica ambientale toggle */}
            <Button 
              className="ml-4 neon-border bg-black/60 text-yellow-300 hover:bg-yellow-400/10"
              size="icon"
              onClick={() => setIsMusicOn((v) => !v)}
              aria-label={isMusicOn ? "Disattiva musica" : "Attiva musica"}
            >
              <Music className={"w-6 h-6 " + (isMusicOn ? "text-green-400 animate-neon-pulse" : "text-yellow-300")} />
            </Button>
          </motion.section>
          
          {/* SLIDER AUTO PREMIO CORRENTE */}
          <EventCarousel />

          {/* SLIDER PREMI E MISSIONI FUTURE */}
          <FutureMissionsCarousel />

          {/* (Optional) Placeholder MAPPA LIVE */}
          <motion.section
            className="flex flex-col items-center justify-center py-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Button
              variant="secondary"
              className="text-white glass-card px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105"
              onClick={() => navigate("/map")}
            >
              <Map className="w-5 h-5" /> Mappa LIVE (prossimamente)
            </Button>
            <span className="mt-2 text-xs text-yellow-200 opacity-70 italic">(Sarà visibile chi trova indizi in tempo reale)</span>
          </motion.section>

          {/* SEZIONE INVITA UN AMICO */}
          <InviteFriendSection />
        </>
      )}
    </div>
  );
}
