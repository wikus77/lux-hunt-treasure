/**
 * M1SSION™ Lottery Ticket Card
 * Biglietto della lotteria con design premium
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Trophy, Clock, Sparkles } from 'lucide-react';

interface LotteryTicketCardProps {
  ticketCode: string;
  status: 'active' | 'winner' | 'void';
  createdAt: string;
  drawRank?: number | null;
  prizeAmount?: number | null;
  isNew?: boolean;
  onClick?: () => void;
}

const LotteryTicketCard: React.FC<LotteryTicketCardProps> = ({
  ticketCode,
  status,
  createdAt,
  drawRank,
  prizeAmount,
  isNew = false,
  onClick
}) => {
  // Format ticket code: 123-456-789-A
  const formattedCode = ticketCode 
    ? `${ticketCode.slice(0, 3)}-${ticketCode.slice(3, 6)}-${ticketCode.slice(6, 9)}-${ticketCode.slice(9)}`
    : '---';
  
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const isWinner = status === 'winner';
  
  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0, rotateY: -180 } : { opacity: 1 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        duration: isNew ? 0.8 : 0.3
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer select-none ${isNew ? 'z-10' : ''}`}
    >
      {/* Ticket Container */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: isWinner 
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
            : 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0a1628 100%)',
          boxShadow: isWinner
            ? '0 8px 32px rgba(251, 191, 36, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)'
            : '0 8px 32px rgba(30, 58, 95, 0.5), inset 0 0 60px rgba(0, 200, 255, 0.05)',
          border: isWinner ? '2px solid #fcd34d' : '1px solid rgba(0, 200, 255, 0.3)',
        }}
      >
        {/* Shimmer effect for new tickets */}
        {isNew && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
          />
        )}
        
        {/* Top Section - Logo & Badge */}
        <div className="relative p-4 pb-2">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300c8ff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative flex items-center justify-between">
            {/* Logo M1SSION */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                <span className="text-cyan-400">M1</span>
                <span className={isWinner ? 'text-black' : 'text-white'}>SSION</span>
              </span>
              <span className={`text-xs font-medium ${isWinner ? 'text-black/60' : 'text-white/40'}`}>™</span>
            </div>
            
            {/* Status Badge */}
            {isWinner ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/20">
                <Trophy className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-black">VINCENTE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                {/* 🏪 STORE COMPLIANT: Progress path, not lottery */}
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">PERCORSO</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Perforated Line */}
        <div className="relative flex items-center px-2">
          <div className="w-4 h-4 rounded-full bg-black -ml-4" />
          <div 
            className="flex-1 border-t-2 border-dashed mx-2"
            style={{ borderColor: isWinner ? 'rgba(0,0,0,0.2)' : 'rgba(0, 200, 255, 0.2)' }}
          />
          <div className="w-4 h-4 rounded-full bg-black -mr-4" />
        </div>
        
        {/* Main Section - Ticket Code */}
        <div className="relative p-4 pt-3">
          <div className="text-center">
            <p className={`text-xs uppercase tracking-wider mb-1 ${isWinner ? 'text-black/60' : 'text-white/40'}`}>
              Numero Biglietto
            </p>
            <div className="relative">
              <p 
                className={`text-2xl font-mono font-bold tracking-[0.2em] ${isWinner ? 'text-black' : 'text-white'}`}
                style={{ 
                  textShadow: isWinner 
                    ? 'none' 
                    : '0 0 20px rgba(0, 200, 255, 0.5)',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                }}
              >
                {formattedCode}
              </p>
              {isNew && (
                <motion.div
                  className="absolute -right-2 -top-2"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Prize info if winner */}
          {isWinner && prizeAmount && (
            <div className="mt-3 text-center">
              <p className="text-sm text-black/60">Premio</p>
              <p className="text-xl font-bold text-black">+{prizeAmount.toLocaleString()} M1U</p>
            </div>
          )}
          
          {/* Bottom Info */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: isWinner ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-1">
              <Clock className={`w-3 h-3 ${isWinner ? 'text-black/40' : 'text-white/40'}`} />
              <span className={`text-xs ${isWinner ? 'text-black/60' : 'text-white/50'}`}>
                {formattedDate}
              </span>
            </div>
            <div className={`text-xs ${isWinner ? 'text-black/40' : 'text-cyan-400/60'}`}>
              M1SSION™ LOTTERY
            </div>
          </div>
        </div>
        
        {/* Holographic stripe */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-8"
          style={{
            background: isWinner
              ? 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,215,0,0.2) 50%, rgba(255,255,255,0.3) 100%)'
              : 'linear-gradient(180deg, rgba(0,200,255,0.1) 0%, rgba(120,0,255,0.1) 50%, rgba(0,200,255,0.1) 100%)',
          }}
        />
      </div>
    </motion.div>
  );
};

export default LotteryTicketCard;

