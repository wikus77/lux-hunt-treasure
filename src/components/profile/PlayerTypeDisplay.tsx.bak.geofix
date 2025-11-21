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
    >
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-3">{playerType.icon}</div>
          <Badge 
            variant="outline" 
            className="mb-3 text-sm"
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