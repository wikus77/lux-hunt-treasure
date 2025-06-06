
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Timer, TrendingUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface Mission {
  id: string;
  title: string;
  status: string;
  publication_date: string;
}

export const TimeBox: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    fetchActiveMission();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (mission) {
        calculateTimeLeft();
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [mission]);

  const fetchActiveMission = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'active')
        .order('publication_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching mission:', error);
        return;
      }

      if (data && data.length > 0) {
        setMission(data[0]);
        calculateTimeLeft(data[0]);
      }
    } catch (error) {
      console.error('Error in fetchActiveMission:', error);
    }
  };

  const calculateTimeLeft = (missionData?: Mission) => {
    const currentMission = missionData || mission;
    if (!currentMission) return;

    const startDate = new Date(currentMission.publication_date);
    const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const now = new Date();
    
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const remaining = endDate.getTime() - now.getTime();

    if (remaining > 0) {
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ days, hours, minutes });
      setProgressPercent(Math.min(100, Math.max(0, (elapsed / totalTime) * 100)));
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      setProgressPercent(100);
    }
  };

  const getDeadlineDate = () => {
    if (!mission) return 'N/A';
    const startDate = new Date(mission.publication_date);
    const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    return endDate.toLocaleDateString('it-IT');
  };

  return (
    <div className="flip-card-container perspective-1000 h-32 w-full">
      <motion.div
        className="flip-card transform-style-3d relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Front */}
        <div className="flip-card-front backface-hidden absolute inset-0 bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-lg p-4 border border-orange-500/30">
          <div className="flex items-center justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-orange-400">Tempo Rimasto</h3>
              <p className="text-xl font-bold text-white">
                {timeLeft.days}g {timeLeft.hours}h {timeLeft.minutes}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back backface-hidden absolute inset-0 bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-lg p-4 border border-red-500/30 rotate-y-180">
          <h3 className="text-sm font-bold text-red-400 mb-3">Timer Missione</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-xs text-white/70">Scadenza Prevista</p>
                <p className="text-sm font-semibold text-white">{getDeadlineDate()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <div className="flex-1">
                <p className="text-xs text-white/70">Avanzamento</p>
                <div className="w-full bg-black/30 rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-white mt-1">{Math.round(progressPercent)}%</p>
              </div>
            </div>

            {mission && (
              <div className="bg-black/20 rounded p-2">
                <p className="text-xs text-orange-400 font-semibold">{mission.title}</p>
                <p className="text-xs text-white/60">Status: {mission.status}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
