// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { isWinningPrize } from '@/utils/dailySpinUtils';
import { PRIZE_CONFIG } from '@/utils/dailySpinPrizeMap';

interface DailySpinResultModalProps {
  isOpen: boolean;
  prize: string;
  message: string;
  reroute_path?: string | null;
  onClose: () => void;
}

export const DailySpinResultModal: React.FC<DailySpinResultModalProps> = ({
  isOpen,
  prize,
  message,
  reroute_path,
  onClose
}) => {
  const [, setLocation] = useLocation();

  // Auto-close effect for losing prizes
  useEffect(() => {
    if (isOpen && !isWinningPrize(prize)) {
        const timer = setTimeout(() => {
          setLocation('/home');
        }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, prize, setLocation]);

  const handleRedirect = () => {
    if (reroute_path) {
      setLocation(reroute_path);
    } else {
      setLocation('/home');
    }
  };

  if (!isOpen) return null;

  const winning = isWinningPrize(prize);
  const prizeConfig = PRIZE_CONFIG[prize as keyof typeof PRIZE_CONFIG];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Modal */}
      <div className={`relative mx-4 p-8 rounded-2xl border-2 max-w-md w-full text-center animate-scale-in ${
        winning 
          ? 'bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border-cyan-400/50' 
          : 'bg-gradient-to-br from-gray-900/40 to-slate-900/40 border-gray-500/50'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        boxShadow: winning 
          ? '0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1)'
          : '0 0 30px rgba(0, 0, 0, 0.5)'
      }}
      >
        
        {/* Icon */}
        <div className={`mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
          winning 
            ? 'bg-gradient-to-br from-cyan-400 to-purple-500 text-white' 
            : 'bg-gray-600 text-gray-300'
        }`}
        style={{
          filter: winning 
            ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))'
            : 'none',
          boxShadow: winning
            ? 'inset 0 0 20px rgba(255, 255, 255, 0.2)'
            : 'none'
        }}
        >
          {winning ? '🎉' : '😞'}
        </div>

        {/* Title */}
        <h2 className={`font-mission text-3xl font-bold mb-4 tracking-wider ${
          winning ? 'text-cyan-400' : 'text-gray-400'
        }`}
        style={{
          textShadow: winning 
            ? '0 0 20px rgba(0, 255, 255, 0.8)'
            : 'none'
        }}
        >
          {winning ? 'CONGRATULAZIONI!' : 'RIPROVA DOMANI'}
        </h2>

        {/* Prize */}
        <div className="mb-6">
          <p className={`text-2xl font-bold mb-3 font-display ${
            winning ? 'text-white' : 'text-gray-300'
          }`}>
            {prize}
          </p>
          <p className={`text-lg ${
            winning ? 'text-cyan-200' : 'text-gray-400'
          }`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {winning && reroute_path ? (
            <Button 
              onClick={handleRedirect}
              className="w-full font-mission text-lg py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl border-2 border-cyan-400/50 transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.4))',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
              }}
            >
              RISCATTA SUBITO
            </Button>
          ) : (
            <Button 
              onClick={() => setLocation('/home')}
              variant="outline"
              className="w-full py-3 border-gray-500 text-gray-300 hover:bg-gray-800"
            >
              Torna alla Home
            </Button>
          )}
          
          <p className={`text-sm ${
            winning ? 'text-cyan-300/80' : 'text-gray-500'
          }`}>
            {winning 
              ? 'Torna domani per un nuovo giro!' 
              : 'Chiusura automatica tra 2.5 secondi...'
            }
          </p>
        </div>
      </div>
    </div>
  );
};