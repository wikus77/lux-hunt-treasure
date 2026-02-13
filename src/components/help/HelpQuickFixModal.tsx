// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🔧 Help Quick Fix Modal - FULLSCREEN (stessa animazione M1U)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Bell, HelpCircle, Gift, Lock, AlertTriangle } from 'lucide-react';
import HelpFlipOverlay from './HelpFlipOverlay';

interface HelpQuickFixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItemConfig {
  id: string;
  icon: React.ElementType;
}

const FAQ_ITEMS_CONFIG: FAQItemConfig[] = [
  { id: 'notifications', icon: Bell },
  { id: 'confused', icon: HelpCircle },
  { id: 'rewards', icon: Gift },
  { id: 'access', icon: Lock },
  { id: 'bug', icon: AlertTriangle },
];

export const HelpQuickFixModal: React.FC<HelpQuickFixModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const FAQ_ITEMS = FAQ_ITEMS_CONFIG.map(item => ({
    ...item,
    question: t(`faq_${item.id}_question`),
    answer: t(`faq_${item.id}_answer`),
  }));

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-help-quickfix-portal"
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
                {t('help_quickfix_title')}
              </h1>
            </div>

            <div style={{ width: '40px' }} />
          </div>
        </div>

        {/* CONTENT - FAQ Accordion */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedId === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    style={{
                      background: 'rgba(25, 25, 35, 0.7)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon style={{ width: '22px', height: '22px', color: '#00D1FF', flexShrink: 0 }} />
                      <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 500, flex: 1, textAlign: 'left' }}>
                        {item.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.5)' }} />
                      ) : (
                        <ChevronDown style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.5)' }} />
                      )}
                    </button>

                    {/* Answer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ 
                            padding: '0 16px 16px 50px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line',
                          }}>
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default HelpQuickFixModal;
