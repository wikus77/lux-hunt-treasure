import { useState, useEffect } from "react";
import AnimatedIntroSection from "./AnimatedIntroSection";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import FuturePrizesCarousel from "./FuturePrizesCarousel";
import InviteFriendSection from "./InviteFriendSection";
import CountdownBanner from "./CountdownBanner";
import BigCountdownTimer from "./BigCountdownTimer";
import { Button } from "@/components/ui/button";
import { Trophy, Map, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InviteOptionsDialog from "./InviteOptionsDialog";

export default function HomeContent() {
  console.log("[HomeContent] COMPONENT MOUNTED!");

  const [step, setStep] = useState<number>(() => {
    try {
      const introAlready = typeof window !== "undefined" && localStorage.getItem("homeIntroShown") === "true";
      console.log("[HomeContent] INIT step – homeIntroShown", introAlready);
      return introAlready ? 1 : 0;
    } catch (err) {
      console.warn("[HomeContent] init error", err);
      return 0;
    }
  });
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    console.log("[HomeContent] useEffect: step value", step);
    if (step === 1 && typeof window !== "undefined") {
      localStorage.setItem("homeIntroShown", "true");
      console.log("[HomeContent] Set homeIntroShown=true in localStorage");
    }
  }, [step]);

  const handleIntroEnd = () => {
    console.log("[HomeContent] handleIntroEnd fired");
    setStep(1);
  };

  const renderDebug = () => (
    <div className="fixed top-0 left-0 z-[99] bg-black/60 text-yellow-300 px-3 py-1 rounded-br-lg text-xs font-mono">
      <div>step: {step}</div>
      <Button size="sm" className="my-1" onClick={()=>setStep(1)}>Forza step=1</Button>
      <Button size="sm" className="my-1" onClick={()=>setStep(0)}>Forza step=0</Button>
    </div>
  );

  return (
    <div className="relative">
      {/* DEBUG: barra rossa rimossa! */}
      {/* {renderDebug()} -- la lasciamo solo se serve debug, ora la rimuoviamo */}

      <AnimatePresence>
        {step === 0 && (
          <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto"}}>
            <AnimatedIntroSection onEnd={handleIntroEnd} />
          </div>
        )}
      </AnimatePresence>
      {step === 1 && (
        <motion.main 
          className="space-y-10" 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <section className="flex flex-col items-center justify-center pt-2 pb-6">
            <BigCountdownTimer />
          </section>
          <section
            className="flex flex-col items-center justify-center fade-in"
          >
            <motion.div
              className="glass-card px-8 py-6 rounded-2xl max-w-2xl text-lg md:text-xl text-center neon-text-cyan shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3 }}
              style={{
                background: "rgba(19,33,52,0.65)",
                border: "1.5px solid #00e5ff88",
                boxShadow: "0 8px 38px 0 rgba(30,174,219,0.20), 0 0px 64px 0 #00e5ff21"
              }}
            >
              “Nel futuro, la caccia al tesoro non è più un gioco… è una sfida globale.<br />
              Ogni mese, una nuova auto di lusso scompare.<br />
              Solo i più intuitivi, strategici e veloci sapranno interpretare gli indizi e scoprire dove si nasconde il premio.<br />
              Entra in <span className="font-bold neon-text-magenta">M1SSION</span>. Vivi l’avventura. Trova il premio. Cambia il tuo destino.”
            </motion.div>
          </section>
          <section className="flex flex-col items-center justify-center mb-8">
            <span
              role="button"
              className="mt-6 text-2xl md:text-3xl font-orbitron neon-text-cyan glass-card px-10 py-4 rounded-2xl shadow-xl cursor-pointer select-none hover:scale-105 transition-all"
              style={{
                textShadow:
                  "0 0 15px #00e5ff, 0 0 30px #00e5ff66, 0 0 24px #fff",
                background: "rgba(19,33,52,0.65)",
                border: "1.5px solid #00e5ff88",
                boxShadow:
                  "0 8px 38px 0 rgba(30,174,219,0.24), 0 0px 64px 0 #00e5ff33"
              }}
              onClick={() => alert("Qui apparirà il popup con i loghi social (Step C)")}
            >
              Invita un amico
            </span>
          </section>
          <div className="flex flex-row items-center justify-center gap-4 px-2 mt-2">
            <Button
              className="neon-border bg-gradient-to-r from-yellow-400 to-pink-500 text-black shadow-lg hover:scale-105"
              onClick={() => window.location.href = "/leaderboard"}
            >
              <Trophy className="w-5 h-5 mr-1" /> Classifica LIVE
            </Button>
            <Button
              size="icon"
              className="ml-2 bg-black/70 neon-border text-yellow-300 hover:bg-yellow-400/10"
              aria-label={musicOn ? "Disattiva musica" : "Attiva musica"}
              onClick={() => setMusicOn(v => !v)}
            >
              <Music className={musicOn ? "text-green-400 animate-neon-pulse w-6 h-6" : "text-yellow-300 w-6 h-6"} />
            </Button>
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
          <section className="flex flex-col items-center py-8 px-4 mt-2">
            <InviteOptionsDialog />
          </section>
        </motion.main>
      )}
    </div>
  );
}
