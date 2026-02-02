// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Notifiche - Section Modal Content (Revolut-style glass design)
import React, { useState, useEffect } from 'react';
import { X, Bell, Volume2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

interface NotificationsSectionContentProps {
  onClose: () => void;
}

const NotificationsSectionContent: React.FC<NotificationsSectionContentProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const {
    preferences,
    resolvedTags,
    isLoading: prefsLoading,
    availableCategories,
    togglePreference,
    refreshPreferences,
    hasActivePreferences
  } = useNotificationPreferences();
  
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    weekly_hints: 'all' as 'all' | 'only-premium' | 'none',
    push_notifications_enabled: false,
    sound_enabled: true,
    haptic_enabled: true
  });

  const categoryIcons: Record<string, string> = {
    'Luxury & moda': '💎',
    'Viaggi & esperienze': '✈️',
    'Sport & fitness': '⚽',
    'Tecnologia': '📱',
    'Food & beverage': '🍷',
    'Arte & cultura': '🎨'
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('notifications_enabled, weekly_hints, push_notifications_enabled')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSettings(prev => ({
          ...prev,
          notifications_enabled: profile.notifications_enabled ?? true,
          weekly_hints: (profile.weekly_hints as 'all' | 'only-premium' | 'none') || 'all',
          push_notifications_enabled: profile.push_notifications_enabled ?? false
        }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<typeof settings>) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await supabase.from('profiles').update({
        notifications_enabled: updatedSettings.notifications_enabled,
        weekly_hints: updatedSettings.weekly_hints,
        push_notifications_enabled: updatedSettings.push_notifications_enabled
      }).eq('id', user.id);
      setSettings(updatedSettings);
      toast({ title: "✅ Impostazioni salvate" });
    } catch (error) {
      toast({ title: "❌ Errore salvataggio", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = async (category: string) => {
    const success = await togglePreference(category);
    if (success) {
      toast({ title: "✅ Preferenza aggiornata" });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(150, 40, 40, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>NOTIFICHE</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Preferenze e alert</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* General Notifications */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Notifiche Email</span>
          </div>

          <ToggleRow 
            label="Notifiche Generali" 
            description="Ricevi aggiornamenti importanti via email"
            checked={settings.notifications_enabled}
            onChange={(v) => saveSettings({ notifications_enabled: v })}
            disabled={loading}
          />

          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Suggerimenti Settimanali</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'only-premium', 'none'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => saveSettings({ weekly_hints: option })}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '10px',
                    background: settings.weekly_hints === option ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${settings.weekly_hints === option ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                    color: settings.weekly_hints === option ? '#EF4444' : 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {option === 'all' ? 'Tutti' : option === 'only-premium' ? 'Premium' : 'Nessuno'}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Categories */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Categorie di Interesse</span>
            <button onClick={refreshPreferences} disabled={prefsLoading} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw style={{ width: '16px', height: '16px', color: '#FFFFFF', animation: prefsLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {hasActivePreferences && (
            <p style={{ color: '#22C55E', fontSize: '12px', marginBottom: '12px' }}>
              ✅ {resolvedTags.length} tag attivi
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableCategories.map((category) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{categoryIcons[category] || '📱'}</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>{category}</span>
                </div>
                <Toggle checked={preferences[category] || false} onChange={() => handleCategoryToggle(category)} disabled={prefsLoading} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Sound */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Volume2 style={{ width: '20px', height: '20px', color: '#A855F7' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Preferenze Audio</span>
          </div>

          <ToggleRow 
            label="Suoni di Notifica" 
            description="Riproduci suoni per le notifiche"
            checked={settings.sound_enabled}
            onChange={(v) => setSettings({...settings, sound_enabled: v})}
          />
          
          <div style={{ marginTop: '12px' }}>
            <ToggleRow 
              label="Feedback Aptico" 
              description="Vibrazioni per dispositivi mobile"
              checked={settings.haptic_enabled}
              onChange={(v) => setSettings({...settings, haptic_enabled: v})}
            />
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
    <div>
      <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

export default NotificationsSectionContent;
