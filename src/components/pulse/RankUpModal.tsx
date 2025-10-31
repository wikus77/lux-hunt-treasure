// Modal notifica Rank Up con confetti
import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AgentRank } from '@/hooks/usePulseEnergy';

interface RankUpModalProps {
  open: boolean;
  onClose: () => void;
  newRank: AgentRank;
}

const RankUpModal = ({ open, onClose, newRank }: RankUpModalProps) => {
  useEffect(() => {
    if (open) {
      // Confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [newRank.color, '#00f0ff', '#ffffff']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [newRank.color, '#00f0ff', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [open, newRank.color]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/95 border-2" style={{ borderColor: newRank.color }}>
        <div className="text-center space-y-6 py-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{
                backgroundColor: `${newRank.color}20`,
                boxShadow: `0 0 30px ${newRank.color}60`
              }}
            >
              {newRank.symbol}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold gradient-text">RANK UP!</h2>
            </div>
            <p className="text-gray-400 text-sm">Hai raggiunto un nuovo grado</p>
          </div>

          {/* Rank Badge */}
          <div 
            className="p-6 rounded-lg border-2 mx-auto max-w-xs"
            style={{
              backgroundColor: `${newRank.color}10`,
              borderColor: newRank.color
            }}
          >
            <div className="space-y-2">
              <p className="text-3xl font-bold" style={{ color: newRank.color }}>
                {newRank.name_it}
              </p>
              <p className="text-sm font-mono text-gray-400">
                {newRank.code}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                {newRank.description}
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            Continua
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RankUpModal;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
