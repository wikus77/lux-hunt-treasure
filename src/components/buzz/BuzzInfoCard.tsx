
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
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
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
