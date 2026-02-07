// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 📍 Learn BUZZ & Clues Modal - FULLSCREEN
import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Radar, Lightbulb, Unlock, Sparkles } from 'lucide-react';
import { HelpFlipOverlay } from '@/components/help/HelpFlipOverlay';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

interface LearnBuzzCluesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUZZ_INFO = [
  {
    icon: Radar,
    title: 'Cos\'è il BUZZ',
    description: 'Il BUZZ è il tuo strumento principale: attivalo per creare un\'area di ricerca e ricevere indizi.',
    color: '#22C55E',
  },
  {
    icon: Lightbulb,
    title: 'Tipi di indizi',
    description: 'Esistono indizi testuali, visivi e audio. Ogni indizio ti avvicina al premio.',
    color: '#F59E0B',
  },
  {
    icon: Unlock,
    title: 'Sblocca indizi',
    description: 'Usa M1U per sbloccare indizi premium che ti danno un vantaggio competitivo.',
    color: '#A855F7',
  },
  {
    icon: Sparkles,
    title: 'Strategia',
    description: 'Combina più indizi per triangolare la posizione del premio. Più BUZZ fai, più indizi raccogli.',
    color: '#00D1FF',
  },
];

export const LearnBuzzCluesModal: React.FC<LearnBuzzCluesModalProps> = ({ isOpen, onClose }) => {
  const { navigate } = useWouterNavigation();

  const handleGoBuzz = () => {
    onClose();
    setTimeout(() => navigate('/buzz'), 300);
  };

  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-learn-buzzclues-portal"
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
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 100, 50, 0.2) 100%)',
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
              <h1 style={{ color: '#22C55E', fontSize: '20px', fontWeight: 700 }}>
                BUZZ & Indizi
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
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 100, 50, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
            }}>
              <MapPin style={{ width: '36px', height: '36px', color: '#22C55E' }} />
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              Il sistema BUZZ
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              Impara a usare il BUZZ per trovare indizi
            </p>
          </motion.div>

          {/* Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {BUZZ_INFO.map((item, index) => {
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

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoBuzz}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
            }}
          >
            Apri BUZZ
          </motion.button>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default LearnBuzzCluesModal;
