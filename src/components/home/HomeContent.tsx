
import { useState, useEffect } from "react";
import AnimatedIntroSection from "./AnimatedIntroSection";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import { CommandCenter } from "@/components/command-center/CommandCenter";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <div className="relative">
      <AnimatePresence>
        {step === 0 && (
          <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto"}}>
            <AnimatedIntroSection onEnd={handleIntroEnd} />
          </div>
        )}
      </AnimatePresence>
      
      {step === 1 && (
        <motion.main 
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {/* Command Center - Sala di Comando */}
          <CommandCenter />
          
          {/* Luxury Cars Section */}
          <div className="mt-8 px-4">
            <motion.h2 
              className="text-xl font-bold text-center mb-4 text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-cyan-400">Auto di Lusso</span> in Palio
            </motion.h2>
            <FuturisticCarsCarousel />
          </div>
        </motion.main>
      )}
    </div>
  );
}
