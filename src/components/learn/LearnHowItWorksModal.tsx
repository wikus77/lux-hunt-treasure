// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🚀 Learn How It Works Modal - FULLSCREEN
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Rocket, Target, Map, Clock, Award } from 'lucide-react';
import { HelpFlipOverlay } from '@/components/help/HelpFlipOverlay';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

interface LearnHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Target,
    title: 'La Missione',
    description: 'Ogni missione ha un obiettivo: trovare il premio nascosto nella tua città.',
    color: '#00D1FF',
  },
  {
    icon: Map,
    title: 'Esplora',
    description: 'Usa la mappa per esplorare zone, trovare indizi e avvicinarti al premio.',
    color: '#22C55E',
  },
  {
    icon: Clock,
    title: 'Commit Giornaliero',
    titleKey: 'status_commit_label',
    description: 'Completa il commit ogni giorno per mantenere attiva la tua partecipazione.',
    color: '#F59E0B',
  },
  {
    icon: Award,
    title: 'Vinci',
    description: 'Chi trova il premio per primo vince! Scala la classifica per aumentare le tue possibilità.',
    color: '#A855F7',
  },
];

export const LearnHowItWorksModal: React.FC<LearnHowItWorksModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { navigate } = useWouterNavigation();

  const handleGoHome = () => {
    onClose();
    setTimeout(() => navigate('/'), 300);
  };

  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-learn-howitworks-portal"
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
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.3) 0%, rgba(0, 100, 150, 0.2) 100%)',
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
              <h1 style={{ color: '#00D1FF', fontSize: '20px', fontWeight: 700 }}>
                Come funziona
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
              background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.3) 0%, rgba(0, 100, 150, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(0, 209, 255, 0.3)',
            }}>
              <Rocket style={{ width: '36px', height: '36px', color: '#00D1FF' }} />
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              M1SSION in 4 passi
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              Scopri come funziona la caccia al tesoro
            </p>
          </motion.div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
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
                    background: `${step.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: step.color }} />
                  </div>
                  <div>
                    <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                      {index + 1}. {(step as { title?: string; titleKey?: string }).titleKey ? t((step as { titleKey: string }).titleKey) : step.title}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.5' }}>
                      {step.description}
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
            onClick={handleGoHome}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00D1FF 0%, #0096B4 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 209, 255, 0.3)',
            }}
          >
            Vai alla Home
          </motion.button>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default LearnHowItWorksModal;
