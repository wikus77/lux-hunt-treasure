
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Target, Calendar } from "lucide-react";
import { useLongPress } from "@/hooks/useLongPress";
import { useIsMobile } from "@/hooks/use-mobile";

interface Mission {
  id: string;
  title: string;
  totalClues: number;
  foundClues: number;
  timeLimit: string;
  startTime: string;
  remainingDays: number;
  totalDays: number;
}

interface ActiveMissionBoxProps {
  mission: Mission;
}

export function ActiveMissionBox({ mission }: ActiveMissionBoxProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  // Handle click for desktop
  const handleClick = () => {
    if (!isMobile) {
      setIsFullscreen(true);
    }
  };

  // Long press functionality for mobile fullscreen
  const longPressProps = useLongPress(
    () => {
      if (isMobile) {
        setIsFullscreen(true);
      }
    },
    {
      threshold: 800, // 800ms for long press
    }
  );

  // Calculate progress percentage
  const progressPercentage = (mission.foundClues / mission.totalClues) * 100;
  const daysProgressPercentage = ((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100;

  // Fullscreen component
  const FullscreenView = () => (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsFullscreen(false)}
    >
      <div className="h-full w-full p-6 overflow-y-auto">
        <div className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-2">
              <span className="text-[#00D1FF]" style={{ 
                textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
              }}>CACCIA</span>
              <span className="text-white"> AL TESORO URBANO</span>
            </h2>
            <p className="text-white/70 text-lg">Missione ID: {mission.id}</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Indizi trovati box */}
            <div className="rounded-2xl bg-[#121212] border border-green-500/30 p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Indizi trovati</h3>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {mission.foundClues}/{mission.totalClues}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-sm">
                {progressPercentage.toFixed(1)}% completato
              </p>
            </div>

            {/* Tempo rimasto box */}
            <div className="rounded-2xl bg-[#121212] border border-amber-500/30 p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Tempo rimasto</h3>
              </div>
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {mission.remainingDays} giorni
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${daysProgressPercentage}%` }}
                ></div>
              </div>
              <p className="text-white/60 text-sm">
                su {mission.totalDays} giorni totali
              </p>
            </div>

            {/* Stato missione box */}
            <div className="rounded-2xl bg-[#121212] border border-[#00D1FF]/30 p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-[#00D1FF]" />
                <h3 className="text-lg font-bold text-white">Stato missione</h3>
              </div>
              <div className="text-lg font-bold text-[#00D1FF] mb-2">
                ATTIVA
              </div>
              <p className="text-white/60 text-sm mb-2">
                Iniziata il {new Date(mission.startTime).toLocaleDateString()}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div 
        className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        onClick={handleClick}
        {...(isMobile ? longPressProps : {})}
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>CACCIA</span>
            <span className="text-white"> AL TESORO URBANO</span>
          </h2>
          <p className="text-white/70 text-sm">Missione ID: {mission.id}</p>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Indizi trovati box */}
          <div className="rounded-2xl bg-[#121212] border border-green-500/30 p-4 shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-bold text-white">Indizi trovati</h3>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {mission.foundClues}/{mission.totalClues}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-xs">
              {progressPercentage.toFixed(1)}% completato
            </p>
          </div>

          {/* Tempo rimasto box */}
          <div className="rounded-2xl bg-[#121212] border border-amber-500/30 p-4 shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Tempo rimasto</h3>
            </div>
            <div className="text-2xl font-bold text-amber-400 mb-2">
              {mission.remainingDays} giorni
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${daysProgressPercentage}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-xs">
              su {mission.totalDays} giorni totali
            </p>
          </div>

          {/* Stato missione box */}
          <div className="rounded-2xl bg-[#121212] border border-[#00D1FF]/30 p-4 shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-[#00D1FF]" />
              <h3 className="text-sm font-bold text-white">Stato missione</h3>
            </div>
            <div className="text-lg font-bold text-[#00D1FF] mb-2">
              ATTIVA
            </div>
            <p className="text-white/60 text-xs mb-1">
              Iniziata il {new Date(mission.startTime).toLocaleDateString()}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] h-1 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay for mobile and desktop */}
      {isFullscreen && <FullscreenView />}
    </>
  );
}
