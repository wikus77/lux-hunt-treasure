// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Info App - Section Modal Content (Revolut-style glass design)
import React from 'react';
import { X, Info, Globe, Users, Shield, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AppInfoSectionContentProps {
  onClose: () => void;
}

const AppInfoSectionContent: React.FC<AppInfoSectionContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const appInfo = {
    name: "M1SSION™",
    version: "2.0.1",
    build: "2025.01.05",
    environment: "Production",
    developer: "NIYVORA KFT™",
    ceo: "Joseph MULÉ"
  };

  const features = [
    { icon: Globe, title: t('feature_global_missions'), description: t('feature_global_missions_desc'), color: "#00D1FF" },
    { icon: Users, title: t('feature_community'), description: t('feature_community_desc'), color: "#22C55E" },
    { icon: Shield, title: t('feature_security'), description: t('feature_security_desc'), color: "#F59E0B" },
    { icon: Smartphone, title: t('feature_multiplatform'), description: t('feature_multiplatform_desc'), color: "#A855F7" }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.8) 0%, rgba(60, 60, 150, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('app_info_title')}</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('app_info_subtitle')}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* App Identity */}
        <GlassCard style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Info style={{ width: '40px', height: '40px', color: '#6366F1' }} />
          </div>
          
          <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #6366F1, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {appInfo.name}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <InfoBox label={t('version')} value={appInfo.version} color="#6366F1" />
            <InfoBox label={t('build')} value={appInfo.build} color="#6366F1" />
          </div>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('environment')}</span>
              <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.2)', color: '#22C55E', fontSize: '12px', fontWeight: 600 }}>{appInfo.environment}</span>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{t('developer')}</span>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{appInfo.developer}</span>
            </div>
          </div>
        </GlassCard>

        {/* Features */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '16px', background: 'linear-gradient(90deg, #00D1FF, #00B8E6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('features')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ padding: '10px', borderRadius: '10px', background: `${feature.color}20` }}>
                      <Icon style={{ width: '20px', height: '20px', color: feature.color }} />
                    </div>
                    <div>
                      <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{feature.title}</h4>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Supporta il Progetto — HIDDEN (placeholder; Apple QA) */}

        {/* Copyright */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>
            © 2025 Joseph MULÉ – M1SSION™
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            ALL RIGHTS RESERVED – NIYVORA KFT™
          </p>
        </div>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Info Box
const InfoBox: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
    <p style={{ color: color, fontSize: '18px', fontWeight: 700 }}>{value}</p>
  </div>
);

export default AppInfoSectionContent;
