
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

  // Main countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTimeRemaining();
      setRemainingTime(newTime);
      
      if (isCountdownComplete(newTime) && !showFinalMessage) {
        setShowFinalMessage(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showFinalMessage]);
  
  // Enhanced pulse animation effect triggered every 10 seconds
  useEffect(() => {
    const currentSeconds = remainingTime.seconds;
    if (currentSeconds % 10 === 0 && currentSeconds !== prevSecondsRef.current) {
      setPulseTrigger(true);
      setTimeout(() => setPulseTrigger(false), 1000);
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
      {/* Futuristic title with glow effect */}
      <CountdownTitle text="Tempo rimasto alla prossima missione" />

      <CountdownContainer pulseTrigger={pulseTrigger}>
        {/* Digital display grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-6 w-full max-w-3xl mx-auto">
          {/* Time unit blocks - Days */}
          <TimeBlock 
            value={remainingTime.days} 
            label="GIORNI"
            pulsing={pulseTrigger}
          />

          {/* Time unit blocks - Hours */}
          <TimeBlock 
            value={remainingTime.hours} 
            label="ORE"
            pulsing={pulseTrigger}
          />

          {/* Time unit blocks - Minutes */}
          <TimeBlock 
            value={remainingTime.minutes} 
            label="MINUTI"
            pulsing={pulseTrigger}
          />

          {/* Time unit blocks - Seconds */}
          <TimeBlock 
            value={remainingTime.seconds} 
            label="SECONDI"
            pulsing={pulseTrigger}
            highlight={true}
          />
        </div>

        {/* Mission complete overlay */}
        <AnimatePresence>
          <MissionComplete showFinalMessage={showFinalMessage} />
        </AnimatePresence>
      </CountdownContainer>
    </motion.div>
  );
}
