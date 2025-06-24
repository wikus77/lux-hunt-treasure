
import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, CheckCircle } from "lucide-react";
import GradientBox from "@/components/ui/gradient-box";

interface Mission {
  id: string;
  title: string;
  totalClues: number;
  foundClues: number;
  timeLimit: string;
  remainingDays: number;
  totalDays: number;
}

interface ActiveMissionBoxProps {
  mission: Mission;
  purchasedClues: any[];
  progress: number;
}

export function ActiveMissionBox({ mission, purchasedClues, progress }: ActiveMissionBoxProps) {
  const progressPercentage = (mission.foundClues / mission.totalClues) * 100;
  const daysProgressPercentage = ((mission.totalDays - mission.remainingDays) / mission.totalDays) * 100;

  return (
    <GradientBox className="w-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION<span className="text-xs align-top">™</span> STATUS</span>
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{mission.title}</h3>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            ATTIVA
          </span>
        </div>

        {/* Mission Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Found Clues */}
          <div className="flex items-center space-x-3 bg-black/20 rounded-lg p-3">
            <Target className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="text-sm text-white/70">Indizi Trovati</div>
              <div className="text-lg font-bold text-white">
                {mission.foundClues}/{mission.totalClues}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center space-x-3 bg-black/20 rounded-lg p-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-sm text-white/70">Giorni Rimanenti</div>
              <div className="text-lg font-bold text-white">
                {mission.remainingDays} giorni
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${daysProgressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Progress Score */}
          <div className="flex items-center space-x-3 bg-black/20 rounded-lg p-3">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-sm text-white/70">Punteggio</div>
              <div className="text-lg font-bold text-white">
                {progress}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Clues Summary */}
        {purchasedClues.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-sm text-blue-300 mb-2">Indizi Acquistati:</div>
            <div className="text-xs text-white/70">
              {purchasedClues.length} indizio/i acquistato/i - Ultimo: {purchasedClues[0]?.title || "N/A"}
            </div>
          </div>
        )}
      </div>
    </GradientBox>
  );
}
