// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Clock, Shield } from 'lucide-react';

interface AccessCountdownProps {
  missionStartDate?: Date;
  className?: string;
}

export const AccessCountdown: React.FC<AccessCountdownProps> = ({
  missionStartDate = new Date('2025-08-19T05:00:00Z'), // Default mission start
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const missionTime = missionStartDate.getTime();
      const difference = missionTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null); // Mission has started
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [missionStartDate]);

  if (!timeLeft) {
    return (
      <div className={`text-center p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl backdrop-blur-sm ${className}`}>
        <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">🚀 MISSIONE ATTIVA!</h3>
        <p className="text-green-300">
          La M1SSION™ è ora disponibile per l'accesso.
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl backdrop-blur-sm ${className}`}>
      <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-orange-400 mb-4">⏳ ACCESSO TEMPORANEAMENTE DISATTIVATO</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-gray-400 uppercase">Giorni</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-gray-400 uppercase">Ore</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-400 uppercase">Min</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-400 uppercase">Sec</div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm">
        L'accesso alla M1SSION™ sarà disponibile il{' '}
        <span className="text-orange-400 font-semibold">
          {missionStartDate.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </p>
    </div>
  );
};