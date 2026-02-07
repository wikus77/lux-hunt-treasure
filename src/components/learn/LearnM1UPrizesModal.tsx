// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 💰 Learn M1U & Prizes Modal - FULLSCREEN
import React from 'react';
import { motion } from 'framer-motion';
import { X, Coins, Gift, ShoppingCart, Zap, Star } from 'lucide-react';
import { HelpFlipOverlay } from '@/components/help/HelpFlipOverlay';

interface LearnM1UPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const M1U_INFO = [
  {
    icon: Coins,
    title: 'Cosa sono gli M1U',
    description: 'M1 Units (M1U) sono la valuta di M1SSION. Li usi per sbloccare indizi e funzionalità premium.',
    color: '#F59E0B',
  },
  {
    icon: Zap,
    title: 'Come guadagnare M1U',
    description: 'Completa il commit giornaliero, trova indizi, partecipa a eventi e invita amici.',
    color: '#22C55E',
  },
  {
    icon: ShoppingCart,
    title: 'Acquista M1U',
    description: 'Puoi acquistare pacchetti M1U direttamente dallo Shop con prezzi vantaggiosi.',
    color: '#00D1FF',
  },
  {
    icon: Gift,
    title: 'Premi reali',
    description: 'Il premio finale è un oggetto di valore reale. Chi lo trova per primo vince!',
    color: '#A855F7',
  },
  {
    icon: Star,
    title: 'Bonus e streak',
    description: 'Mantieni lo streak di commit giornalieri per ottenere bonus M1U moltiplicati.',
    color: '#EC4899',
  },
];

export const LearnM1UPrizesModal: React.FC<LearnM1UPrizesModalProps> = ({ isOpen, onClose }) => {
  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-learn-m1uprizes-portal"
      zIndex={100001}
    >
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(150, 90, 0, 0.2) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <h1 style={{ color: '#F59E0B', fontSize: '20px', fontWeight: 700 }}>
                M1U & Premi
              </h1>
            </div>

            <div style={{ width: '40px' }} />
          </div>
        </div>

        {/* CONTENT */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '28px' }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(150, 90, 0, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
            }}>
              <Coins style={{ width: '36px', height: '36px', color: '#F59E0B' }} />
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              Economia M1SSION
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              Guadagna, spendi e vinci premi reali
            </p>
          </motion.div>

          {/* Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {M1U_INFO.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: 'rgba(25, 25, 35, 0.7)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${item.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: item.color }} />
                  </div>
                  <div>
                    <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                      {item.title}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info note */}
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '12px', 
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            Gli M1U non scadono mai e possono essere usati in qualsiasi missione.
          </p>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default LearnM1UPrizesModal;
