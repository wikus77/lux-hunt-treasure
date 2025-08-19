
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowDown, Check } from "lucide-react";
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";

export default function MissionSelection() {
  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState<"uomo" | "donna" | null>(null);

  const handleSelectMission = (gender: "uomo" | "donna") => {
    setSelectedMission(gender);
    setTimeout(() => {
      navigate(`/register?preference=${gender}`);
    }, 500);
  };

  // Target date from utility
  const targetDate = getMissionDeadline();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-[#00D1FF]/10 filter blur-[100px]"></div>
        <div className="absolute top-[40%] right-[15%] w-72 h-72 rounded-full bg-[#F059FF]/10 filter blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 rounded-full bg-[#7B2EFF]/10 filter blur-[100px]"></div>
      </div>

      {/* Background particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[10%] left-[5%] w-2 h-2 rounded-full bg-[#00D1FF] opacity-70 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-3 h-3 rounded-full bg-[#F059FF] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[15%] w-2 h-2 rounded-full bg-[#7B2EFF] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </motion.div>

      {/* Header Section with Countdown */}
      <motion.div
        className="text-center pt-16 pb-8 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 
          className="text-4xl md:text-6xl font-orbitron mb-4"
          style={{ 
            background: "linear-gradient(to right, #00D1FF, #7B2EFF, #F059FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 15px rgba(0, 209, 255, 0.5)"
          }}
        >
          <span className="text-[#00D1FF]">SELECT</span> <span className="text-[#00D1FF]">M1</span><span className="text-white">SSION</span>
        </h1>
        
        <p className="text-white/80 max-w-2xl mx-auto text-lg mb-6">
          Due missioni ogni mese. Premi reali. Solo un vincitore.
        </p>
        
        {/* Countdown Timer */}
        <div className="flex justify-center mb-4">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </motion.div>

      {/* For Him Section */}
      <motion.section
        className="px-4 py-8 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="bg-black/40 backdrop-blur-md border border-[#00D1FF]/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,209,255,0.15)]"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="md:flex">
            {/* Image container - on top in mobile, on left in desktop */}
            <div className="relative md:w-1/2">
              <div className="relative h-[300px] md:h-full">
                <img 
                  src="/lovable-uploads/c893d261-4ae4-4c9b-b360-cda568b713ee.png" 
                  alt="Luxury Men's Prizes" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:bg-gradient-to-r"></div>
              </div>
            </div>
            
            {/* Content container */}
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-orbitron text-white mb-3">
                FOR HIM – <span className="text-[#00D1FF]">M1</span><span className="text-white">SSION</span>
              </h2>
              
              <p className="text-white/80 mb-4">
                Partecipa a missioni con premi reali come Lamborghini Huracán, Rolex Daytona, Ducati Panigale e altri oggetti esclusivi.
              </p>
              
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-white/80">
                  <Check className="text-[#00D1FF] mr-2 h-5 w-5" />
                  Auto di lusso
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#00D1FF] mr-2 h-5 w-5" />
                  Moto da corsa
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#00D1FF] mr-2 h-5 w-5" />
                  Orologi in oro
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#00D1FF] mr-2 h-5 w-5" />
                  Immobili e investimenti
                </li>
              </ul>
              
              <motion.button
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#7B2EFF] to-[#F059FF] text-white font-bold text-lg shadow-[0_0_15px_rgba(240,89,255,0.3)] transition-all duration-300"
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 0 30px rgba(240, 89, 255, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMission("uomo")}
              >
                SCEGLI MISSIONE FOR HIM
              </motion.button>
              
              {selectedMission === "uomo" && (
                <div className="mt-3 text-center">
                  <span className="text-[#00D1FF] text-sm animate-pulse">Missione selezionata</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* For Her Section */}
      <motion.section
        className="px-4 py-8 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div 
          className="bg-black/40 backdrop-blur-md border border-[#F059FF]/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(240,89,255,0.15)]"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="md:flex flex-row-reverse">
            {/* Image container - on top in mobile, on right in desktop */}
            <div className="relative md:w-1/2">
              <div className="relative h-[300px] md:h-full">
                <img 
                  src="/lovable-uploads/f996d464-f915-4a83-92bd-f1799ef28c1f.png" 
                  alt="Luxury Women's Prizes" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:bg-gradient-to-l"></div>
              </div>
            </div>
            
            {/* Content container */}
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-orbitron text-white mb-3">
                FOR HER – <span className="text-[#00D1FF]">M1</span><span className="text-white">SSION</span>
              </h2>
              
              <p className="text-white/80 mb-4">
                Partecipa a missioni con premi esclusivi come Birkin Hermès, Chanel Classic, Louis Vuitton, Rolex in oro rosa e altro.
              </p>
              
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-white/80">
                  <Check className="text-[#F059FF] mr-2 h-5 w-5" />
                  Borse iconiche
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#F059FF] mr-2 h-5 w-5" />
                  Orologi di lusso
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#F059FF] mr-2 h-5 w-5" />
                  Gioielli preziosi
                </li>
                <li className="flex items-center text-white/80">
                  <Check className="text-[#F059FF] mr-2 h-5 w-5" />
                  Accessori moda
                </li>
              </ul>
              
              <motion.button
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white font-bold text-lg shadow-[0_0_15px_rgba(0,209,255,0.3)] transition-all duration-300"
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 0 30px rgba(0, 209, 255, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMission("donna")}
              >
                SCEGLI MISSIONE FOR HER
              </motion.button>
              
              {selectedMission === "donna" && (
                <div className="mt-3 text-center">
                  <span className="text-[#00D1FF] text-sm animate-pulse">Missione selezionata</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Info Block */}
      <motion.div 
        className="text-center px-4 py-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-2xl font-orbitron text-white mb-4">Hai scelto la tua missione?</h3>
        <p className="text-white/70 mb-6">
          Dopo la scelta, accederai al modulo di registrazione per diventare un agente <span className="text-[#00D1FF]">M1</span><span className="text-white">SSION</span>. Potrai sempre cambiare missione più avanti.
        </p>
        
        <div className="mb-4 text-sm text-white/60">
          <p>Potrai sempre cambiare tipo di missione in seguito</p>
          <p>Ogni mese nuovi premi, nuove sfide e solo un vincitore</p>
          <p>Le missioni sono vere. I premi sono reali.</p>
        </div>
        
        {/* Animated scroll arrow */}
        <motion.div 
          className="flex justify-center" 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="text-[#00D1FF] w-8 h-8" />
        </motion.div>
      </motion.div>
    </div>
  );
}
