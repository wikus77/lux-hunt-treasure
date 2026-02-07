// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🤖 Help Contact AION Modal - FULLSCREEN (stessa animazione M1U)
import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, Sparkles, Brain, Zap } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import HelpFlipOverlay from './HelpFlipOverlay';

interface HelpContactAionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpContactAionModal: React.FC<HelpContactAionModalProps> = ({ isOpen, onClose }) => {
  const { navigate } = useWouterNavigation();

  const handleGoToAion = () => {
    onClose();
    // Chiudi anche il modale Help principale se possibile
    setTimeout(() => {
      navigate('/intelligence');
    }, 300);
  };

  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-help-aion-portal"
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
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.35) 0%, rgba(80, 40, 120, 0.25) 100%)',
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
              <h1 style={{ color: '#A855F7', fontSize: '20px', fontWeight: 700 }}>
                Parla con AION
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
            padding: '24px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* AION Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(124, 58, 237, 0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)',
              position: 'relative',
            }}
          >
            <Brain style={{ width: '50px', height: '50px', color: '#A855F7' }} />
            
            {/* Pulse effect */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(168, 85, 247, 0.5)',
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            AION Intelligence
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '15px',
              textAlign: 'center',
              lineHeight: '1.6',
              maxWidth: '300px',
              marginBottom: '32px',
            }}
          >
            AION è il tuo assistente intelligente. Può aiutarti con qualsiasi domanda sulla missione, strategie e problemi tecnici.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {[
              { icon: Sparkles, label: 'Suggerimenti' },
              { icon: MessageCircle, label: 'Chat 24/7' },
              { icon: Zap, label: 'Risposte rapide' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '22px', height: '22px', color: '#A855F7' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{feature.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoToAion}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '16px 32px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
            }}
          >
            <MessageCircle style={{ width: '20px', height: '20px' }} />
            Vai ad AION
          </motion.button>

          {/* Footer */}
          <p style={{ 
            color: 'rgba(255,255,255,0.35)', 
            fontSize: '12px', 
            textAlign: 'center',
            marginTop: '24px',
          }}>
            AION risponde in italiano e inglese
          </p>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default HelpContactAionModal;
