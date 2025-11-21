
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

const BuzzInfoCard: React.FC = () => {
  return (
    <Card 
      className="relative overflow-hidden rounded-[24px]"
      style={{
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Animated glow strip like header */}
      <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
          style={{
            animation: 'slideGlowBuzz 3s ease-in-out infinite',
            width: '200%',
            left: '-100%'
          }}
        />
      </div>
      <style>{`
        @keyframes slideGlowBuzz {
          0% { transform: translateX(0); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Come funziona il Buzz</p>
            <p>
              Premi il pulsante per inviare un segnale e scoprire nuove aree sulla mappa. 
              Ogni Buzz ti aiuta a trovare indizi nascosti nella tua zona.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuzzInfoCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
