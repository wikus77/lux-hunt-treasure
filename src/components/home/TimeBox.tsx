
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Clock } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  publication_date: string;
  status: string;
}

const TimeBox = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    progress: 0
  });

  useEffect(() => {
    fetchActiveMission();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveMission = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setMission(data);
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
    }
  };

  const updateTimer = () => {
    if (!mission) return;

    const missionStart = new Date(mission.publication_date);
    const missionEnd = new Date(missionStart.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 giorni
    const now = new Date();
    const timeRemaining = missionEnd.getTime() - now.getTime();

    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      const totalDuration = 30 * 24 * 60 * 60 * 1000;
      const elapsed = totalDuration - timeRemaining;
      const progress = Math.round((elapsed / totalDuration) * 100);

      setTimeLeft({ days, hours, minutes, progress });
    }
  };

  return (
    <motion.div
      className="flip-box relative h-32 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Front */}
      <div className="flip-box-front bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-4 flex items-center justify-between text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-lg">Tempo Rimasto</h3>
          </div>
          <p className="text-2xl font-bold text-orange-200">{timeLeft.days}d {timeLeft.hours}h</p>
        </div>
        <div className="text-4xl opacity-30">⏱️</div>
      </div>

      {/* Back */}
      <div className="flip-box-back bg-gradient-to-br from-orange-800 to-orange-900 rounded-xl p-4 text-white">
        <h3 className="font-bold text-lg mb-3 text-center">Dettagli Missione</h3>
        {mission ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-orange-300">Titolo Missione</div>
              <div className="font-semibold">{mission.title}</div>
            </div>
            
            <div className="bg-orange-700/50 rounded-lg p-2">
              <div className="text-sm text-orange-300">Tempo Rimanente</div>
              <div className="font-bold text-lg">{timeLeft.days} giorni, {timeLeft.hours} ore, {timeLeft.minutes} minuti</div>
            </div>

            <div className="bg-orange-700/50 rounded-lg p-2">
              <div className="text-sm text-orange-300">Avanzamento Temporale</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-900 rounded-full h-2">
                  <div 
                    className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${timeLeft.progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{timeLeft.progress}%</span>
              </div>
            </div>

            <div className="text-xs text-center text-orange-300">
              Inizio: {new Date(mission.publication_date).toLocaleDateString('it-IT')}
            </div>
          </div>
        ) : (
          <div className="text-center text-orange-300">Nessuna missione attiva</div>
        )}
      </div>
    </motion.div>
  );
};

export default TimeBox;
