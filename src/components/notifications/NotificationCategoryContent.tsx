// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 Notification Category Content - REVOLUT STYLE
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationCategoryContentProps {
  title: string;
  notifications: Notification[];
  unreadCount: number;
  accentColor: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCategoryContent: React.FC<NotificationCategoryContentProps> = ({
  title,
  notifications,
  unreadCount,
  accentColor,
  onClose,
  onSelect,
  onDelete
}) => {
  const { t } = useTranslation();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER - Gradient based on accent color */}
      <div style={{
        flexShrink: 0,
        background: `linear-gradient(180deg, ${accentColor}40 0%, ${accentColor}20 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Bell style={{ width: '20px', height: '20px', color: accentColor }} />
              <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>{title}</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              {notifications.length === 1 
                ? t('notifications_count_one', { count: 1 }) 
                : t('notifications_count_other', { count: notifications.length })}
              {unreadCount > 0 && ` • ${t('notifications_unread_count', { count: unreadCount })}`}
            </p>
          </div>
          <div style={{ width: '40px' }} />
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px', 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', 
        WebkitOverflowScrolling: 'touch' 
      }}>
        {/* Stats Summary */}
        <GlassCard style={{ 
          marginBottom: '16px', 
          background: `linear-gradient(135deg, ${accentColor}15 0%, rgba(0, 209, 255, 0.05) 100%)`,
          border: `1px solid ${accentColor}25`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: accentColor }}>{notifications.length}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{t('notifications_total')}</p>
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#00D1FF' }}>{unreadCount}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{t('notifications_unread')}</p>
            </div>
          </div>
        </GlassCard>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <GlassCard>
                  <NotificationItem
                    notification={notification}
                    onSelect={() => onSelect(notification.id)}
                    onDelete={() => onDelete(notification.id)}
                  />
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <GlassCard style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 16px',
                borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.3)' }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{t('notifications_none')}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{t('notifications_new_appear')}</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(25, 25, 35, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '14px',
    padding: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
    ...style,
  }}>
    {children}
  </div>
);

export default NotificationCategoryContent;
