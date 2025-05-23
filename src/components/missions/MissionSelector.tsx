
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export interface MissionSelectorProps {
  onSelect?: (gender: "uomo" | "donna") => void;
  redirectToRegister?: boolean;
}

export default function MissionSelector({ 
  onSelect, 
  redirectToRegister = true 
}: MissionSelectorProps) {
  const [selected, setSelected] = useState<"uomo" | "donna" | null>(null);
  const navigate = useNavigate();

  const handleSelect = (gender: "uomo" | "donna") => {
    setSelected(gender);
    
    if (onSelect) {
      onSelect(gender);
    }
    
    if (redirectToRegister) {
      // Navigate to register with the selected preference
      navigate(`/register?preference=${gender}`);
    }
  };

  const handleSwitchMission = (gender: "uomo" | "donna") => (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect(gender);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white flex flex-col items-center justify-center px-4 py-12">
      <motion.h1
        className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ 
          background: "linear-gradient(to right, #00D1FF, #7B2EFF, #F059FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 15px rgba(0, 209, 255, 0.5)"
        }}
      >
        SCEGLI LA TUA MISSIONE
      </motion.h1>

      <motion.div 
        className="flex flex-col md:flex-row gap-8 max-w-5xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <MissionCard
          type="uomo"
          title="PREMI UOMO"
          subtitle="Auto, orologi, moto, case, oro..."
          bgImage="/lovable-uploads/507c2f6d-4ed0-46dc-b53c-79e1d5b7515e.png"
          onClick={() => handleSelect("uomo")}
          switchText="OPPURE... Partecipa a quelle DONNA"
          onSwitch={handleSwitchMission("donna")}
          selected={selected === "uomo"}
        />
        
        <MissionCard
          type="donna"
          title="PREMI DONNA"
          subtitle="Borse, gioielli, orologi, accessori..."
          bgImage="/lovable-uploads/55b484c2-04bc-4fb2-a650-1910fd650b89.png"
          onClick={() => handleSelect("donna")}
          switchText="OPPURE... Partecipa a quelle UOMO"
          onSwitch={handleSwitchMission("uomo")}
          selected={selected === "donna"}
        />
      </motion.div>

      <motion.p 
        className="mt-10 text-sm text-center text-white/70 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <span className="font-semibold text-[#00D1FF]">2 MISSIONI AL MESE</span> – ISCRIVITI E SCEGLI ORA
        <br />
        <span className="text-xs text-white/50 mt-2 block">
          Potrai sempre cambiare tipo di missione in seguito
          <br />
          I premi sono reali. Le missioni sono serie.
        </span>
      </motion.p>
    </div>
  );
}

interface MissionCardProps {
  type: "uomo" | "donna";
  title: string;
  subtitle: string;
  bgImage: string;
  onClick: () => void;
  switchText: string;
  onSwitch: (e: React.MouseEvent) => void;
  selected?: boolean;
}

function MissionCard({ 
  title, 
  subtitle, 
  bgImage, 
  onClick, 
  switchText, 
  onSwitch,
  selected 
}: MissionCardProps) {
  return (
    <motion.div
      className={`relative bg-cover bg-center w-full h-[400px] rounded-[24px] overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${
        selected ? "ring-2 ring-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]" : ""
      }`}
      style={{ backgroundImage: `url(${bgImage})` }}
      onClick={onClick}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0, 209, 255, 0.2)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90"></div>
      
      <div className="relative h-full w-full p-6 flex flex-col justify-between z-10">
        <div className="mt-4">
          <motion.h2 
            className="text-3xl font-orbitron font-bold text-white"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.5)" }}
          >
            {title}
          </motion.h2>
          <p className="text-lg text-white/80 mt-2">{subtitle}</p>
        </div>
        
        <div className="space-y-3">
          <Button
            className="w-full py-6 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00D1FF] hover:to-[#F059FF] text-white font-bold shadow-[0_0_15px_rgba(0,209,255,0.3)] transition-all duration-300 hover:scale-105"
            size="lg"
            onClick={onClick}
          >
            {title === "PREMI UOMO" ? "PARTECIPA ALLE MISSIONI UOMO" : "PARTECIPA ALLE MISSIONI DONNA"}
          </Button>
          
          <p 
            className="text-sm text-center text-white/70 hover:text-white cursor-pointer transition-all"
            onClick={onSwitch}
          >
            {switchText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
