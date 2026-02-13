// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 📊 Help System Status Modal - FULLSCREEN (stessa animazione M1U)
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, CheckCircle, Wifi, Database, Gift, Target, Clock } from 'lucide-react';
import HelpFlipOverlay from './HelpFlipOverlay';

interface HelpSystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatusItemConfig {
  id: string;
  icon: React.ElementType;
  status: 'online' | 'offline' | 'checking';
}

const STATUS_CONFIG: StatusItemConfig[] = [
  { id: 'connection', icon: Wifi, status: 'online' },
  { id: 'sync', icon: Database, status: 'online' },
  { id: 'rewards', icon: Gift, status: 'online' },
  { id: 'missions', icon: Target, status: 'online' },
  { id: 'commit', icon: Clock, status: 'online' },
];

export const HelpSystemStatusModal: React.FC<HelpSystemStatusModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const SYSTEM_STATUSES = STATUS_CONFIG.map(item => ({
    ...item,
    label: t(`status_${item.id}_label`),
    detail: t(`status_${item.id}_detail`),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22C55E';
      case 'offline': return '#EF4444';
      case 'checking': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return t('status_online');
      case 'offline': return t('status_offline');
      case 'checking': return t('status_checking');
      default: return '—';
    }
  };

  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-help-status-portal"
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
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(20, 80, 50, 0.2) 100%)',
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
                {t('help_status_title')}
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
          {/* Status Card */}
          <div
            style={{
              background: 'rgba(25, 25, 35, 0.7)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Overall Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <CheckCircle style={{ width: '32px', height: '32px', color: '#22C55E' }} />
              <div>
                <p style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>{t('status_all_operational')}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{t('status_last_update')}</p>
              </div>
            </div>

            {/* Individual Statuses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {SYSTEM_STATUSES.map((item, index) => {
                const Icon = item.icon;
                const color = getStatusColor(item.status);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.6)' }} />
                      <span style={{ color: '#FFFFFF', fontSize: '15px' }}>{item.label}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                        {item.detail || getStatusLabel(item.status)}
                      </span>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}80`,
                      }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '12px', 
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            {t('status_footer')}
          </p>
        </div>
      </div>
    </HelpFlipOverlay>
  );
};

export default HelpSystemStatusModal;
