import { useState, useEffect } from "react";
import AnimatedIntroSection from "./AnimatedIntroSection";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";
import { CommandCenter } from "@/components/command-center/CommandCenter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Zap, Lightbulb } from "lucide-react";

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

  // Module unlock states
  const [unlockedModules, setUnlockedModules] = useState(() => {
    try {
      const savedUnlocks = typeof window !== "undefined" && localStorage.getItem("unlockedModules");
      return savedUnlocks ? JSON.parse(savedUnlocks) : {
        mission: true, // Always unlocked
        analysis: false,
        intel: false,
        shortcuts: false
      };
    } catch (err) {
      console.warn("[HomeContent] unlock state init error", err);
      return { mission: true, analysis: false, intel: false, shortcuts: false };
    }
  });

  // Simulate unlocking modules after certain time periods (for demo purposes)
  useEffect(() => {
    if (step === 1) {
      // Mission is already unlocked by default
      
      // Unlock Analysis after 10 seconds
      const analysisTimer = setTimeout(() => {
        unlockModule('analysis');
      }, 10000);
      
      // Unlock Intel after 15 seconds
      const intelTimer = setTimeout(() => {
        unlockModule('intel');
      }, 15000);
      
      // Unlock Shortcuts after 20 seconds
      const shortcutsTimer = setTimeout(() => {
        unlockModule('shortcuts');
      }, 20000);
      
      return () => {
        clearTimeout(analysisTimer);
        clearTimeout(intelTimer);
        clearTimeout(shortcutsTimer);
      };
    }
  }, [step]);

  useEffect(() => {
    console.log("[HomeContent] useEffect: step value", step);
    if (step === 1 && typeof window !== "undefined") {
      localStorage.setItem("homeIntroShown", "true");
      console.log("[HomeContent] Set homeIntroShown=true in localStorage");
    }
  }, [step]);

  useEffect(() => {
    localStorage.setItem("unlockedModules", JSON.stringify(unlockedModules));
  }, [unlockedModules]);

  const handleIntroEnd = () => {
    console.log("[HomeContent] handleIntroEnd fired");
    setStep(1);
  };

  const unlockModule = (moduleName) => {
    console.log(`[HomeContent] Unlocking module: ${moduleName}`);
    setUnlockedModules(prev => ({
      ...prev,
      [moduleName]: true
    }));
    
    // Play unlock sound
    const unlockSound = new Audio('/sounds/chime.mp3');
    unlockSound.volume = 0.5;
    unlockSound.play().catch(e => console.warn("Audio play failed:", e));
  };

  const handleModuleClick = (moduleName) => {
    if (!unlockedModules[moduleName]) {
      console.log(`[HomeContent] Attempted to access locked module: ${moduleName}`);
      
      // Play denied access sound
      const deniedSound = new Audio('/sounds/buzz.mp3');
      deniedSound.volume = 0.3;
      deniedSound.play().catch(e => console.warn("Audio play failed:", e));
      
      // For demo purposes, let's unlock the module when clicked
      // In a real app, this would be triggered by actual game progress
      setTimeout(() => unlockModule(moduleName), 1500);
    }
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 pb-12"
        >
          {/* Dark Zone Title */}
          <motion.div 
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            <h1 className="text-2xl md:text-3xl font-orbitron text-cyan-400 mb-1">
              LA ZONA OSCURA
            </h1>
            <p className="text-white/60 text-sm">
              Sistema di Comando • <span className="text-cyan-400/80">Livello di accesso: Operativo</span>
            </p>
            <div className="w-full max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-4"></div>
          </motion.div>

          {/* Command Center Modules with Dark Zone concept */}
          <div className="grid gap-6 px-4">
            {/* Mission Panel - Always available */}
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
              onClick={() => handleModuleClick('mission')}
            >
              <div className={`bg-black/60 backdrop-blur-md border ${unlockedModules.mission ? 'border-cyan-500/50' : 'border-gray-700/30'} rounded-xl overflow-hidden`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className={`text-lg font-medium ${unlockedModules.mission ? 'text-cyan-400' : 'text-gray-500'}`}>
                      <Shield className="inline-block mr-2 w-4 h-4" /> Missione Attiva
                    </h2>
                    {unlockedModules.mission ? (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Online</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full">Offline</span>
                    )}
                  </div>
                  
                  {unlockedModules.mission ? (
                    <div className="h-40 bg-black/40">
                      <div className="CommandCenter_MissionPanel h-full">
                        {/* Mission content will be displayed here */}
                        {/* This is just a placeholder for the actual CommandCenter component */}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-black/80 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="mx-auto w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-gray-600">Accesso sistema richiesto</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Analysis Board */}
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: unlockedModules.analysis ? 1 : 0.4 }}
              transition={{ duration: 0.5 }}
              className="relative"
              onClick={() => handleModuleClick('analysis')}
            >
              <div className={`bg-black/60 backdrop-blur-sm border ${unlockedModules.analysis ? 'border-purple-500/50' : 'border-gray-700/30'} rounded-xl overflow-hidden`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className={`text-lg font-medium ${unlockedModules.analysis ? 'text-purple-400' : 'text-gray-500'}`}>
                      <Lightbulb className="inline-block mr-2 w-4 h-4" /> Tavolo di Analisi
                    </h2>
                    {unlockedModules.analysis ? (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Attivo</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full">Bloccato</span>
                    )}
                  </div>
                  
                  {unlockedModules.analysis ? (
                    <div className="h-32 bg-black/40">
                      <div className="CommandCenter_AnalysisBoard h-full">
                        {/* Analysis content */}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 bg-black/80 backdrop-blur-lg filter flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="mx-auto w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-gray-600">Attendere primo indizio</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!unlockedModules.analysis && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80 pointer-events-none"></div>
              )}
            </motion.div>
            
            {/* Intel Feed */}
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{ opacity: unlockedModules.intel ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className="relative"
              onClick={() => handleModuleClick('intel')}
            >
              <div className={`bg-black/60 backdrop-blur-sm border ${unlockedModules.intel ? 'border-amber-500/50' : 'border-gray-700/30'} rounded-xl overflow-hidden`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className={`text-lg font-medium ${unlockedModules.intel ? 'text-amber-400' : 'text-gray-500'}`}>
                      <Zap className="inline-block mr-2 w-4 h-4" /> Feed Intel
                    </h2>
                    {unlockedModules.intel ? (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Connesso</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full">Disconnesso</span>
                    )}
                  </div>
                  
                  {unlockedModules.intel ? (
                    <div className="h-24 bg-black/40">
                      <div className="CommandCenter_IntelFeed h-full">
                        {/* Intel content */}
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-black/80 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ3JheSIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')]"></div>
                      </div>
                      <div className="text-center z-10">
                        <Lock className="mx-auto w-6 h-6 text-gray-600 mb-2" />
                        <p className="text-gray-600">Segnale non disponibile</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!unlockedModules.intel && (
                <motion.div 
                  className="absolute inset-0 bg-black/70 pointer-events-none"
                  animate={{ opacity: [0.7, 0.5, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity }}
                ></motion.div>
              )}
            </motion.div>
            
            {/* Contextual Shortcuts */}
            <motion.div
              initial={{ opacity: 0.2 }}
              animate={{ opacity: unlockedModules.shortcuts ? 1 : 0.2 }}
              transition={{ duration: 0.5 }}
              className="relative"
              onClick={() => handleModuleClick('shortcuts')}
            >
              <div className={`bg-black/60 backdrop-blur-sm border ${unlockedModules.shortcuts ? 'border-cyan-500/50' : 'border-gray-700/30'} rounded-xl overflow-hidden`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className={`text-lg font-medium ${unlockedModules.shortcuts ? 'text-cyan-400' : 'text-gray-500'}`}>
                      Accessi Rapidi
                    </h2>
                    {unlockedModules.shortcuts ? (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Disponibile</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full">Inaccessibile</span>
                    )}
                  </div>
                  
                  {unlockedModules.shortcuts ? (
                    <div className="h-16 bg-black/40">
                      <div className="CommandCenter_Shortcuts h-full">
                        {/* Shortcuts content */}
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 bg-black/80 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm">In attesa di connessione</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!unlockedModules.shortcuts && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/70 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>
                </>
              )}
            </motion.div>
          </div>

          {/* Display actual CommandCenter once all modules are unlocked */}
          {unlockedModules.mission && unlockedModules.analysis && unlockedModules.intel && unlockedModules.shortcuts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-8"
            >
              <CommandCenter />
            </motion.div>
          )}
          
          {/* Remove the "Luxury Cars Section" completely */}
        </motion.div>
      )}
    </div>
  );
}
