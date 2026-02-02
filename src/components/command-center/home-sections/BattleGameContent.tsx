// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Battle Game Content - REVOLUT STYLE con PracticeMode
import React from "react";
import { X, ArrowLeft } from "lucide-react";
import { PracticeMode } from "@/components/battle/PracticeMode";

interface BattleGameContentProps {
  userId: string;
  onClose: () => void;
  onBack: () => void;
}

export const BattleGameContent: React.FC<BattleGameContentProps> = ({
  userId,
  onClose,
  onBack
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back Button */}
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Lobby
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              color: '#FC1EFF', 
              fontSize: '18px', 
              fontWeight: 700,
              letterSpacing: '1px',
            }}>
              BATTLE ARENA
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
              Test your reflexes!
            </p>
          </div>

          {/* Close Button */}
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
        </div>
      </div>

      {/* CONTENT - PracticeMode */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <GlassCard>
          <PracticeMode userId={userId} />
        </GlassCard>
      </div>
    </div>
  );
};

// GLASS CARD
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default BattleGameContent;
