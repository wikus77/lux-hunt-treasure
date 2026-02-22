// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Missione - Section Modal Content (Revolut-style glass design)
import React from 'react';
import { X, Target, TrendingUp, Award, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';

interface MissionSectionContentProps {
  onClose: () => void;
}

const MissionSectionContent: React.FC<MissionSectionContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { battleFxMode, setBattleFxMode, isLoading } = usePerformanceSettings();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.8) 0%, rgba(180, 100, 0, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: '20px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('mission_title')}</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('mission_subtitle')}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Current Mission */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 209, 255, 0.2)' }}>
                <Target style={{ width: '24px', height: '24px', color: '#00D1FF' }} />
              </div>
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('current_mission')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Gennaio 2025</p>
              </div>
            </div>
            <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.2)', color: '#22C55E', fontSize: '12px', fontWeight: 600 }}>{t('active')}</span>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('general_progress')}</span>
              <span style={{ color: '#00D1FF', fontSize: '14px', fontWeight: 700 }}>45%</span>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ width: '45%', height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #00D1FF, #00B8E6)' }} />
            </div>
          </div>
        </GlassCard>

        {/* Mission Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 209, 255, 0.2)', width: 'fit-content', margin: '0 auto 12px' }}>
                <TrendingUp style={{ width: '28px', height: '28px', color: '#00D1FF' }} />
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 700 }}>7</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{t('completed')}</p>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', width: 'fit-content', margin: '0 auto 12px' }}>
                <Award style={{ width: '28px', height: '28px', color: '#F59E0B' }} />
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 700 }}>3</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{t('prizes')}</p>
            </div>
          </GlassCard>
        </div>

        {/* Battle FX Settings */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('battle_fx_settings')}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '16px' }}>
            {t('battle_fx_description')}
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setBattleFxMode('high')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: battleFxMode === 'high' ? 'rgba(0, 209, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${battleFxMode === 'high' ? '#00D1FF' : 'rgba(255,255,255,0.1)'}`,
                color: battleFxMode === 'high' ? '#00D1FF' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>{t('high_quality')}</p>
              <p style={{ fontSize: '11px', opacity: 0.7 }}>{t('full_effects')}</p>
            </button>
            
            <button
              onClick={() => setBattleFxMode('low')}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: battleFxMode === 'low' ? 'rgba(0, 209, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${battleFxMode === 'low' ? '#00D1FF' : 'rgba(255,255,255,0.1)'}`,
                color: battleFxMode === 'low' ? '#00D1FF' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>{t('performance')}</p>
              <p style={{ fontSize: '11px', opacity: 0.7 }}>{t('simplified_effects')}</p>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

export default MissionSectionContent;
