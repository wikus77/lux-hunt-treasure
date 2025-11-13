/**
 * Agent Battle Card - Displayed when clicking agent marker
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Shield as ShieldIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgentBattleCardProps {
  isOpen: boolean;
  onClose: () => void;
  agentCode: string;
  displayName?: string;
  rank?: string;
  reputation?: number;
  isAttackable: boolean;
  status?: 'available' | 'ghost' | 'shielded' | 'in_battle';
  onAttack: () => void;
}

const STATUS_CONFIG = {
  available: {
    label: 'Available for Battle',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  ghost: {
    label: 'Ghost Mode Active',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  shielded: {
    label: 'Shield Active',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  in_battle: {
    label: 'Currently in Battle',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export function AgentBattleCard({
  isOpen,
  onClose,
  agentCode,
  displayName,
  rank,
  reputation,
  isAttackable,
  status = 'available',
  onAttack,
}: AgentBattleCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="fixed left-1/2 top-[20%] z-[1201] w-[90%] max-w-[400px]"
            style={{ marginLeft: '-45%' }}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="rounded-2xl bg-background/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-4 bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <Swords className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400">{agentCode}</h3>
                      {displayName && (
                        <p className="text-xs text-muted-foreground">{displayName}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full hover:bg-cyan-500/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Agent Info */}
                <div className="grid grid-cols-2 gap-3">
                  {rank && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Rank</p>
                      <p className="font-semibold text-sm">{rank}</p>
                    </div>
                  )}
                  {reputation !== undefined && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Reputation</p>
                      <p className="font-semibold text-sm">{reputation}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div
                  className={`
                    p-3 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {status === 'shielded' && <ShieldIcon className="h-4 w-4" />}
                    {status === 'in_battle' && <Clock className="h-4 w-4 animate-pulse" />}
                    <span className={`text-sm font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Attack Button */}
                <Button
                  onClick={onAttack}
                  disabled={!isAttackable}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Swords className="mr-2 h-5 w-5" />
                  {isAttackable ? 'Attack this Agent' : 'Cannot Attack'}
                </Button>

                {!isAttackable && (
                  <p className="text-xs text-center text-muted-foreground">
                    This agent is currently unavailable for battle
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
