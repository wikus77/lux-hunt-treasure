
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTimeRemaining, isCountdownComplete, type TimeRemaining } from "./countdown/countdownUtils";
import TimeBlock from "./countdown/TimeBlock";
import CountdownTitle from "./countdown/CountdownTitle";
import CountdownContainer from "./countdown/CountdownContainer";
import MissionComplete from "./countdown/MissionComplete";

export default function NeonSplitCountdown() {
  const [remainingTime, setRemainingTime] = useState<TimeRemaining>(getTimeRemaining());
  const [pulseTrigger, setPulseTrigger] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const prevSecondsRef = useRef(remainingTime.seconds);
  const timerRef = useRef<number | null>(null);

  // Effetto principale per il timer del countdown
  useEffect(() => {
    // Funzione di aggiornamento del timer
    const updateTimer = () => {
      const newTime = getTimeRemaining();
      setRemainingTime(newTime);
      
      if (isCountdownComplete(newTime) && !showFinalMessage) {
        setShowFinalMessage(true);
      }
    };

    // Impostazione iniziale e intervallo
    updateTimer(); // Aggiorna immediatamente
    timerRef.current = window.setInterval(updateTimer, 1000);
    
    // Pulizia quando il componente viene smontato
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [showFinalMessage]);
  
  // Effetto migliorato per l'animazione di impulso ogni 10 secondi
  useEffect(() => {
    const currentSeconds = remainingTime.seconds;
    if (currentSeconds % 10 === 0 && currentSeconds !== prevSecondsRef.current) {
      setPulseTrigger(true);
      const timeout = setTimeout(() => setPulseTrigger(false), 1000);
      return () => clearTimeout(timeout); // Pulizia del timeout
    }
    prevSecondsRef.current = currentSeconds;
  }, [remainingTime.seconds]);

  return (
    <motion.div 
      className="mt-8 mb-14 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Titolo futuristico con effetto luminoso */}
      <CountdownTitle text="Tempo rimasto alla prossima missione" />

      <CountdownContainer pulseTrigger={pulseTrigger}>
        {/* Griglia del display digitale */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-6 w-full max-w-3xl mx-auto">
          {/* Blocchi delle unità di tempo - Giorni */}
          <TimeBlock 
            value={remainingTime.days} 
            label="GIORNI"
            pulsing={pulseTrigger}
          />

          {/* Blocchi delle unità di tempo - Ore */}
          <TimeBlock 
            value={remainingTime.hours} 
            label="ORE"
            pulsing={pulseTrigger}
          />

          {/* Blocchi delle unità di tempo - Minuti */}
          <TimeBlock 
            value={remainingTime.minutes} 
            label="MINUTI"
            pulsing={pulseTrigger}
          />

          {/* Blocchi delle unità di tempo - Secondi */}
          <TimeBlock 
            value={remainingTime.seconds} 
            label="SECONDI"
            pulsing={pulseTrigger}
            highlight={true}
          />
        </div>

        {/* Overlay per il completamento della missione */}
        <AnimatePresence>
          <MissionComplete showFinalMessage={showFinalMessage} />
        </AnimatePresence>
      </CountdownContainer>
    </motion.div>
  );
}
