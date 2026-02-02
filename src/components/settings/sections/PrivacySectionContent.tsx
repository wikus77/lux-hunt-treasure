// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Privacy - Section Modal Content (Revolut-style glass design)
import React, { useState, useEffect } from 'react';
import { X, Lock, Database, Cookie, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface PrivacySectionContentProps {
  onClose: () => void;
}

interface PrivacySettings {
  data_collection: boolean;
  analytics_enabled: boolean;
  marketing_consent: boolean;
  cookie_preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

const PrivacySectionContent: React.FC<PrivacySectionContentProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    data_collection: true,
    analytics_enabled: true,
    marketing_consent: false,
    cookie_preferences: {
      essential: true,
      analytics: true,
      marketing: false
    }
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`privacy_settings_${user.id}`);
      if (stored) setSettings(JSON.parse(stored));
    }
  }, [user]);

  const saveSettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = { ...settings, ...newSettings };
      localStorage.setItem(`privacy_settings_${user.id}`, JSON.stringify(updated));
      setSettings(updated);
      toast({ title: "✅ Impostazioni privacy salvate" });
    } catch (error) {
      toast({ title: "❌ Errore salvataggio", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCookieChange = (type: keyof PrivacySettings['cookie_preferences'], enabled: boolean) => {
    saveSettings({ cookie_preferences: { ...settings.cookie_preferences, [type]: enabled } });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.8) 0%, rgba(100, 50, 150, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>PRIVACY</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Gestione consensi e cookie</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Data Collection */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database style={{ width: '20px', height: '20px', color: '#A855F7' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Raccolta Dati</span>
          </div>

          <ToggleRow 
            label="Consenso Raccolta Dati" 
            description="Autorizza M1SSION™ a raccogliere dati"
            checked={settings.data_collection}
            onChange={(v) => saveSettings({ data_collection: v })}
            disabled={loading}
          />

          <Divider />

          <ToggleRow 
            label="Analytics" 
            description="Analisi del comportamento per ottimizzare l'app"
            checked={settings.analytics_enabled}
            onChange={(v) => saveSettings({ analytics_enabled: v })}
            disabled={loading}
          />

          <Divider />

          <ToggleRow 
            label="Marketing" 
            description="Comunicazioni promozionali e offerte"
            checked={settings.marketing_consent}
            onChange={(v) => saveSettings({ marketing_consent: v })}
            disabled={loading}
          />
        </GlassCard>

        {/* Cookie Preferences */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Cookie style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Preferenze Cookie</span>
          </div>

          <ToggleRow 
            label="Cookie Essenziali" 
            description="Necessari per il funzionamento base"
            checked={settings.cookie_preferences.essential}
            onChange={() => {}}
            disabled={true}
          />

          <Divider />

          <ToggleRow 
            label="Cookie Analytics" 
            description="Analisi dell'uso dell'app"
            checked={settings.cookie_preferences.analytics}
            onChange={(v) => handleCookieChange('analytics', v)}
            disabled={loading}
          />

          <Divider />

          <ToggleRow 
            label="Cookie Marketing" 
            description="Per personalizzare contenuti promozionali"
            checked={settings.cookie_preferences.marketing}
            onChange={(v) => handleCookieChange('marketing', v)}
            disabled={loading}
          />
        </GlassCard>

        {/* Privacy Info */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Eye style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Informazioni Privacy</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '16px' }}>
            I tuoi dati sono protetti secondo il Regolamento GDPR e vengono utilizzati esclusivamente per migliorare la tua esperienza con M1SSION™.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Dati Raccolti:</h4>
            <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, paddingLeft: '16px' }}>
              <li>Informazioni del profilo utente</li>
              <li>Progressi di gioco e indizi completati</li>
              <li>Preferenze dell'applicazione</li>
              <li>Dati di utilizzo anonimi (se autorizzato)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>I Tuoi Diritti:</h4>
            <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, paddingLeft: '16px' }}>
              <li>Accesso ai tuoi dati personali</li>
              <li>Correzione di informazioni inesatte</li>
              <li>Cancellazione del tuo account</li>
              <li>Portabilità dei dati</li>
            </ul>
          </div>

          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 209, 255, 0.15)',
            border: '1px solid rgba(0, 209, 255, 0.3)',
            color: '#00D1FF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Download size={16} />
            Scarica i Miei Dati
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Divider
const Divider = () => <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0' }} />;

// Toggle
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      background: checked ? '#22C55E' : 'rgba(255,255,255,0.1)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      background: '#FFFFFF',
      position: 'absolute',
      top: '2px',
      left: checked ? '22px' : '2px',
      transition: 'left 0.2s',
    }} />
  </button>
);

// Toggle Row
const ToggleRow: React.FC<{ label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ label, description, checked, onChange, disabled }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ flex: 1, marginRight: '12px' }}>
      <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

export default PrivacySectionContent;
