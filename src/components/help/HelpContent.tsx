// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🆘 Help Content - REVOLUT STYLE (iOS WKWebView OPTIMIZED)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Wrench, Activity, MessageCircle, ChevronRight } from 'lucide-react';
import HelpQuickFixModal from './HelpQuickFixModal';
import HelpSystemStatusModal from './HelpSystemStatusModal';
import HelpContactAionModal from './HelpContactAionModal';

interface HelpContentProps {
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'quickfix',
    title: 'Problemi rapidi',
    subtitle: 'Soluzioni alle domande più comuni',
    icon: Wrench,
    color: '#00D1FF',
  },
  {
    id: 'status',
    title: 'Stato sistema',
    subtitle: 'Verifica lo stato dei servizi',
    icon: Activity,
    color: '#22C55E',
  },
  {
    id: 'aion',
    title: 'Parla con AION',
    subtitle: 'Assistenza intelligente 24/7',
    icon: MessageCircle,
    color: '#A855F7',
  },
];

export const HelpContent: React.FC<HelpContentProps> = ({ onClose }) => {
  const [showQuickFix, setShowQuickFix] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showContactAion, setShowContactAion] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    switch (sectionId) {
      case 'quickfix':
        setShowQuickFix(true);
        break;
      case 'status':
        setShowSystemStatus(true);
        break;
      case 'aion':
        setShowContactAion(true);
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
        {/* HEADER - Gradiente blu/viola come Help */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.25) 0%, rgba(124, 58, 237, 0.35) 100%)',
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
                AIUTO
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
            Come possiamo aiutarti oggi?
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
            {HELP_SECTIONS.map((section, index) => {
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
              M1SSION™ • Supporto disponibile 24/7
            </p>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <HelpQuickFixModal 
        isOpen={showQuickFix} 
        onClose={() => setShowQuickFix(false)} 
      />
      <HelpSystemStatusModal 
        isOpen={showSystemStatus} 
        onClose={() => setShowSystemStatus(false)} 
      />
      <HelpContactAionModal 
        isOpen={showContactAion} 
        onClose={() => setShowContactAion(false)} 
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

export default HelpContent;
