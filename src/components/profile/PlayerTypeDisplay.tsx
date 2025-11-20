// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerType {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface PlayerTypeDisplayProps {
  playerType: PlayerType;
  className?: string;
}

const PlayerTypeDisplay: React.FC<PlayerTypeDisplayProps> = ({ playerType, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 15px 50px rgba(0, 229, 255, 0.25)'
      }}
    >
      <Card className="m1ssion-glass-card border-0">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">{playerType.icon}</div>
          <Badge 
            variant="outline" 
            className="mb-4 text-sm glow-border-cyan"
            style={{ borderColor: playerType.color, color: playerType.color }}
          >
            {playerType.name}
          </Badge>
          <p className="text-white/80 text-sm leading-relaxed">
            {playerType.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlayerTypeDisplay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™