// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 📚 Learn Content - REVOLUT STYLE (iOS WKWebView OPTIMIZED)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Rocket, MapPin, Coins, Trophy, ChevronRight } from 'lucide-react';
import LearnHowItWorksModal from './LearnHowItWorksModal';
import LearnBuzzCluesModal from './LearnBuzzCluesModal';
import LearnM1UPrizesModal from './LearnM1UPrizesModal';
import LearnLeaderboardProgressModal from './LearnLeaderboardProgressModal';

interface LearnContentProps {
  onClose: () => void;
}

interface LearnSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'howitworks',
    title: 'Come funziona M1SSION',
    subtitle: 'Scopri le basi del gioco',
    icon: Rocket,
    color: '#00D1FF',
  },
  {
    id: 'buzzclues',
    title: 'BUZZ & Indizi',
    subtitle: 'Impara a trovare e usare gli indizi',
    icon: MapPin,
    color: '#22C55E',
  },
  {
    id: 'm1uprizes',
    title: 'M1U & Premi',
    subtitle: 'Come guadagnare e spendere M1U',
    icon: Coins,
    color: '#F59E0B',
  },
  {
    id: 'leaderboard',
    title: 'Classifica & Progressione',
    subtitle: 'Scala la classifica e vinci',
    icon: Trophy,
    color: '#A855F7',
  },
];

export const LearnContent: React.FC<LearnContentProps> = ({ onClose }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showBuzzClues, setShowBuzzClues] = useState(false);
  const [showM1UPrizes, setShowM1UPrizes] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    switch (sectionId) {
      case 'howitworks':
        setShowHowItWorks(true);
        break;
      case 'buzzclues':
        setShowBuzzClues(true);
        break;
      case 'm1uprizes':
        setShowM1UPrizes(true);
        break;
      case 'leaderboard':
        setShowLeaderboard(true);
        break;
    }
  };

  return (
    <>
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER - Gradiente verde/blu come Learn */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.25) 0%, rgba(0, 150, 180, 0.3) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            {/* X button */}
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

            {/* Title */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: '22px', 
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}>
                IMPARA
              </h1>
            </div>

            {/* Spacer */}
            <div style={{ width: '40px' }} />
          </div>

          {/* Subtitle */}
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '14px', 
            textAlign: 'center',
          }}>
            Diventa un agente esperto
          </p>
        </div>

        {/* CONTENT - Sections */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {LEARN_SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard onClick={() => handleSectionClick(section.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Icon */}
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${section.color}30, ${section.color}15)`,
                        boxShadow: `0 0 20px ${section.color}25`,
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: '26px', height: '26px', color: section.color }} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: '#FFFFFF', 
                          fontSize: '16px', 
                          fontWeight: 600, 
                          marginBottom: '4px',
                        }}>
                          {section.title}
                        </p>
                        <p style={{ 
                          color: 'rgba(255,255,255,0.55)', 
                          fontSize: '13px',
                        }}>
                          {section.subtitle}
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronRight style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              M1SSION™ • La caccia al tesoro del futuro
            </p>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <LearnHowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
      <LearnBuzzCluesModal 
        isOpen={showBuzzClues} 
        onClose={() => setShowBuzzClues(false)} 
      />
      <LearnM1UPrizesModal 
        isOpen={showM1UPrizes} 
        onClose={() => setShowM1UPrizes(false)} 
      />
      <LearnLeaderboardProgressModal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </>
  );
};

// GLASS CARD - REVOLUT STYLE
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
      borderRadius: '16px',
      padding: '18px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

export default LearnContent;
