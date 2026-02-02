// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Battle Console Lobby Content - REVOLUT STYLE
import React from "react";
import { motion } from "framer-motion";
import { X, Swords, Trophy, Users, Zap, Target, Play } from "lucide-react";

interface BattleConsoleLobbyContentProps {
  stats: any;
  onClose: () => void;
  onStartBattle: () => void;
}

export const BattleConsoleLobbyContent: React.FC<BattleConsoleLobbyContentProps> = ({
  stats,
  onClose,
  onStartBattle
}) => {
  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* HEADER - Gradiente magenta/cyan */}
      <div 
        style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(252, 30, 255, 0.3) 0%, rgba(0, 209, 255, 0.2) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ 
              color: '#FC1EFF', 
              fontSize: '18px', 
              fontWeight: 700,
              letterSpacing: '1px',
            }}>
              M1SSION BATTLE
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
              Arena di sfida tra agenti
            </p>
          </div>

          <div style={{ width: '40px' }} />
        </div>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Stats Overview */}
        <GlassCard 
          style={{ 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, rgba(252, 30, 255, 0.15) 0%, rgba(0, 209, 255, 0.1) 100%)',
            border: '1px solid rgba(252, 30, 255, 0.3)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <Trophy style={{ width: '20px', height: '20px', color: '#FACC15', margin: '0 auto 4px' }} />
              <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700 }}>{stats?.total_wins || 0}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Vittorie</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Users style={{ width: '20px', height: '20px', color: '#F87171', margin: '0 auto 4px' }} />
              <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700 }}>{stats?.total_losses || 0}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Sconfitte</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Target style={{ width: '20px', height: '20px', color: '#00D1FF', margin: '0 auto 4px' }} />
              <p style={{ color: '#00D1FF', fontSize: '20px', fontWeight: 700 }}>{stats?.win_rate || 0}%</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Win Rate</p>
            </div>
          </div>
        </GlassCard>

        {/* Battle Arena Info */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #FC1EFF 0%, #00D1FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Swords style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Battle Arena</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.4 }}>
                Sfida i bot AI e metti alla prova i tuoi riflessi. Ottieni M1U o PE (max 5).
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Start Battle Button */}
        <motion.button
          onClick={onStartBattle}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FC1EFF 0%, #00D1FF 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(252, 30, 255, 0.4)',
            marginBottom: '16px',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play style={{ width: '20px', height: '20px' }} />
          INIZIA BATTAGLIA
        </motion.button>

        {/* Best Times */}
        {stats?.best_reaction_ms > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <GlassCard style={{ textAlign: 'center', padding: '12px' }}>
              <p style={{ color: '#FC1EFF', fontSize: '20px', fontWeight: 700 }}>{stats.best_reaction_ms}ms</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Miglior Tempo</p>
            </GlassCard>
            <GlassCard style={{ textAlign: 'center', padding: '12px' }}>
              <p style={{ color: '#FACC15', fontSize: '20px', fontWeight: 700 }}>{stats.avg_reaction_ms || 0}ms</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>Tempo Medio</p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

export default BattleConsoleLobbyContent;
