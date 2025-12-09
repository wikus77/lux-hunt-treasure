// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ SHADOW PROTOCOL™ - Entity Message Component
// Typing effect per messaggi MCP / SHADOW / ECHO

import React, { useEffect, useState, useCallback, useRef } from 'react';

interface EntityMessageProps {
  text: string;
  typingSpeed?: number; // ms per carattere (default: 25)
  onTypingEnd?: () => void;
  className?: string;
}

/**
 * EntityMessage - Componente per visualizzare testo con typing effect
 * Supporta \n per newline
 */
export const EntityMessage: React.FC<EntityMessageProps> = ({
  text,
  typingSpeed = 25,
  onTypingEnd,
  className = '',
}) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Cleanup callback
  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setVisibleChars(0);
    setIsComplete(false);
    cleanup();

    intervalRef.current = window.setInterval(() => {
      if (!mountedRef.current) {
        cleanup();
        return;
      }

      setVisibleChars((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          cleanup();
          setIsComplete(true);
          if (onTypingEnd) {
            // Piccolo delay prima di chiamare onTypingEnd
            setTimeout(() => {
              if (mountedRef.current) {
                onTypingEnd();
              }
            }, 100);
          }
        }
        return next;
      });
    }, typingSpeed);

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [text, typingSpeed, onTypingEnd, cleanup]);

  // Renderizza il testo visibile con cursor
  const visibleText = text.slice(0, visibleChars);

  return (
    <pre className={`shadow-entity-message ${className}`}>
      {visibleText}
      {!isComplete && <span className="shadow-entity-cursor">▌</span>}
    </pre>
  );
};

export default EntityMessage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

