// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Mission Start Narrative Sequence
// Breve sequenza cinematica prima di iniziare la missione
// Integrazione con Shadow Protocol v2

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

interface MissionStartSequenceProps {
  onComplete: () => void;
  onCancel: () => void;
}

const NARRATIVE_LINES = [
  { entity: 'MCP', text: '[MCP//BRIEFING]', delay: 0 },
  { entity: 'MCP', text: 'Agent, your mission is active.', delay: 800 },
  { entity: 'MCP', text: 'Shadow Protocol has been detected.', delay: 2000 },
  { entity: 'SHADOW', text: '[SHADOW//INTERCEPT]', delay: 3500 },
  { entity: 'SHADOW', text: 'We are watching, Echo.', delay: 4300 },
  { entity: 'MCP', text: '[MCP//OVERRIDE]', delay: 5500 },
  { entity: 'MCP', text: 'Trust your coordinates.', delay: 6300 },
  { entity: 'MCP', text: 'The hunt begins now.', delay: 7500 },
];

// 🔥 RIMOSSO AUTO-CONTINUE: L'utente DEVE cliccare per continuare
// const TOTAL_DURATION = 9000; // RIMOSSO

/**
 * MissionStartSequence - Sequenza narrativa breve all'inizio della missione
 * L'utente DEVE cliccare sul bottone per continuare (niente auto-skip!)
 */
export const MissionStartSequence: React.FC<MissionStartSequenceProps> = ({
  onComplete,
  onCancel,
}) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [canContinue, setCanContinue] = useState(false);
  const setIntroActive = useEntityOverlayStore((s) => s.setIntroActive);

  // Disabilita Shadow overlay durante intro
  useEffect(() => {
    setIntroActive(true);
    return () => setIntroActive(false);
  }, [setIntroActive]);

  // Mostra linee progressive
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    NARRATIVE_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => Math.max(prev, index + 1));
      }, line.delay);
      timers.push(timer);
    });

    // Abilita continue dopo ultima linea
    const continueTimer = setTimeout(() => {
      setCanContinue(true);
    }, NARRATIVE_LINES[NARRATIVE_LINES.length - 1].delay + 500);
    timers.push(continueTimer);

    // 🔥 RIMOSSO AUTO-TIMER: L'utente DEVE cliccare!
    // Non più auto-continue dopo timeout

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = useCallback(() => {
    if (canContinue) {
      onComplete();
    }
  }, [canContinue, onComplete]);

  // 🔥 RIMOSSO: Non permettere skip cliccando sullo sfondo
  // L'utente DEVE aspettare il bottone e cliccarlo

  return (
    <motion.div
      className="mission-start-sequence"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // 🔥 RIMOSSO onClick={handleSkip} - L'utente deve usare il bottone
    >
      {/* CRT overlay effect */}
      <div className="mission-start-crt">
        <div className="mission-start-scanlines" />
      </div>

      {/* Content */}
      <div className="mission-start-content">
        <AnimatePresence mode="popLayout">
          {NARRATIVE_LINES.slice(0, visibleLines).map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mission-start-line entity-${line.entity.toLowerCase()}`}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Continue button */}
        <motion.button
          className={`mission-start-continue ${canContinue ? 'visible' : 'hidden'}`}
          onClick={handleContinue}
          initial={{ opacity: 0 }}
          animate={{ opacity: canContinue ? 1 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          INIZIA LA CACCIA
        </motion.button>

        {/* 🔥 RIMOSSO "Tap to skip" - L'utente deve usare il bottone */}
      </div>
    </motion.div>
  );
};

export default MissionStartSequence;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

