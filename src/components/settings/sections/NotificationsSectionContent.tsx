// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Notifiche - Section Modal Content (Revolut-style glass design)
import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { X, Bell, Volume2, RefreshCw, Smartphone, AlertCircle, Check, ChevronRight, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Capacitor } from '@capacitor/core';
import { useNativePush } from '@/hooks/useNativePush';

const M1_SOUND_ENABLED_KEY = 'm1_sound_enabled';
const M1_HAPTICS_ENABLED_KEY = 'm1_haptics_enabled';

/** Play a short beep (Web Audio). iOS-safe: only in handler, webkitAudioContext fallback. No-op on error. */
function playBeep(): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    ctx.resume?.().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Silent fallback
  }
}

/** Trigger haptic feedback via dynamic import (avoids top-level haptics load; safe in WKWebView). */
async function triggerHapticFeedback(): Promise<void> {
  try {
    const mod = await import('@/utils/haptics');
    if (mod?.hapticLight) mod.hapticLight();
  } catch {
    // No-op
  }
}

/** Read haptic enabled from localStorage without importing haptics (avoids crash on modal open). */
function readHapticEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  const v = localStorage.getItem(M1_HAPTICS_ENABLED_KEY);
  return v !== 'false';
}

/** Persist haptic enabled and optionally trigger feedback (dynamic import). */
async function setHapticEnabledAndPersist(enabled: boolean, triggerFeedback: boolean): Promise<void> {
  if (typeof localStorage !== 'undefined') localStorage.setItem(M1_HAPTICS_ENABLED_KEY, String(enabled));
  if (triggerFeedback) await triggerHapticFeedback();
}

// Lazy load push components (dormant - only for debug)
const NativePushDiagnostic = lazy(() => import('@/components/push/NativePushDiagnostic').then(m => ({ default: m.NativePushDiagnostic })));

// Platform check
const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

// Secret tap count to reveal debug panel
const DEBUG_TAP_COUNT = 7;

interface NotificationsSectionContentProps {
  onClose: () => void;
}

const NotificationsSectionContent: React.FC<NotificationsSectionContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // 🔧 Debug panel state (hidden by default)
  const [debugTapCount, setDebugTapCount] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const debugTapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Native push hook for the simple toggle
  const {
    hasPermission: pushPermission,
    isRegistered: pushRegistered,
    requestPermission: requestPushPermission,
    isLoading: pushLoading,
    state: pushState,
  } = useNativePush();
  
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

  // Load sound/haptic from localStorage only (no haptics module import → avoids crash on open)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const soundStored = localStorage.getItem(M1_SOUND_ENABLED_KEY);
      const soundEnabled = soundStored === null ? true : soundStored === 'true';
      const hapticEnabled = readHapticEnabled();
      setSettings(prev => ({ ...prev, sound_enabled: soundEnabled, haptic_enabled: hapticEnabled }));
    } catch {
      // Silent
    }
  }, []);
  
  // Handle secret tap for debug panel
  const handleDebugTap = () => {
    if (debugTapTimeout.current) {
      clearTimeout(debugTapTimeout.current);
    }
    
    setDebugTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= DEBUG_TAP_COUNT) {
        setShowDebugPanel(true);
        toast({ title: "🔧 " + t('debug_mode_activated') });
        return 0;
      }
      return newCount;
    });
    
    // Reset counter after 2 seconds of no taps
    debugTapTimeout.current = setTimeout(() => {
      setDebugTapCount(0);
    }, 2000);
  };
  
  // Handle push notification toggle
  const handlePushToggle = async () => {
    if (pushLoading) return;
    
    if (!pushPermission || !pushRegistered) {
      // Request permission and register
      await requestPushPermission();
      toast({ title: "🔔 " + t('permission_request_sent') });
    } else {
      // Already registered, just toggle the preference in DB
      await saveSettings({ push_notifications_enabled: !settings.push_notifications_enabled });
    }
  };

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
      toast({ title: "✅ " + t('settings_saved') });
    } catch (error) {
      toast({ title: "❌ " + t('error_save_settings'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = async (category: string) => {
    const success = await togglePreference(category);
    if (success) {
      toast({ title: "✅ " + t('preference_updated') });
    }
  };

  const handleSoundToggle = (v: boolean) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(M1_SOUND_ENABLED_KEY, String(v));
      setSettings(prev => ({ ...prev, sound_enabled: v }));
      playBeep();
    } catch {
      setSettings(prev => ({ ...prev, sound_enabled: v }));
    }
  };

  const handleHapticToggle = async (v: boolean) => {
    try {
      setSettings(prev => ({ ...prev, haptic_enabled: v }));
      await setHapticEnabledAndPersist(v, true);
    } catch {
      setSettings(prev => ({ ...prev, haptic_enabled: v }));
      if (typeof localStorage !== 'undefined') localStorage.setItem(M1_HAPTICS_ENABLED_KEY, String(v));
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('notifications_title')}</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('notifications_subtitle')}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* General Notifications */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('email_notifications')}</span>
          </div>

          <ToggleRow 
            label={t('general_notifications')} 
            description={t('general_notifications_desc')}
            checked={settings.notifications_enabled}
            onChange={(v) => saveSettings({ notifications_enabled: v })}
            disabled={loading}
          />

          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>{t('weekly_suggestions')}</p>
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
                  {option === 'all' ? t('all') : option === 'only-premium' ? t('premium') : t('none')}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Categories */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('interest_categories')}</span>
            <button onClick={refreshPreferences} disabled={prefsLoading} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw style={{ width: '16px', height: '16px', color: '#FFFFFF', animation: prefsLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {hasActivePreferences && (
            <p style={{ color: '#22C55E', fontSize: '12px', marginBottom: '12px' }}>
              ✅ {resolvedTags.length} {t('tags_active')}
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

        {/* Push Notifications - Simple Toggle */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}
            onClick={handleDebugTap}
          >
            <Smartphone style={{ width: '20px', height: '20px', color: '#22C55E' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('push_notifications_section')}</span>
          </div>

          {isNativePlatform() ? (
            <>
              {/* Simple Push Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell style={{ width: '18px', height: '18px', color: pushRegistered ? '#22C55E' : '#6B7280' }} />
                    <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{t('receive_push')}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px', marginLeft: '26px' }}>
                    {pushRegistered 
                      ? t('push_active_desc') 
                      : t('push_inactive_desc')}
                  </p>
                </div>
                <Toggle 
                  checked={pushRegistered && settings.push_notifications_enabled}
                  onChange={handlePushToggle}
                  disabled={pushLoading}
                />
              </div>

              {/* Status indicator */}
              {pushRegistered ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#22C55E' }} />
                  <span style={{ color: '#22C55E', fontSize: '13px', fontWeight: 500 }}>{t('push_active')}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
                  <span style={{ color: '#F59E0B', fontSize: '13px' }}>
                    {t('enable_toggle_desc')}
                  </span>
                </div>
              )}

              {/* 🔧 Debug Panel - Hidden until 7 taps on title */}
              {showDebugPanel && (
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>🔧 Debug Panel</span>
                    <button 
                      onClick={() => setShowDebugPanel(false)}
                      style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer' }}
                    >
                      {t('hide')}
                    </button>
                  </div>
                  <Suspense fallback={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ width: '24px', height: '24px', border: '2px solid rgba(34, 197, 94, 0.3)', borderTopColor: '#22C55E', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '8px' }}>{t('loading_diagnostics')}</p>
                    </div>
                  }>
                    <NativePushDiagnostic />
                  </Suspense>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
                <span style={{ color: '#F59E0B', fontSize: '13px' }}>
                  {t('push_native_only')}
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Sound */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Volume2 style={{ width: '20px', height: '20px', color: '#A855F7' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('audio_preferences')}</span>
          </div>

          <ToggleRow 
            label={t('notification_sounds')} 
            description={t('notification_sounds_desc')}
            checked={settings.sound_enabled}
            onChange={handleSoundToggle}
          />
          
          <div style={{ marginTop: '12px' }}>
            <ToggleRow 
              label={t('haptic_feedback')} 
              description={t('haptic_feedback_desc')}
              checked={settings.haptic_enabled}
              onChange={handleHapticToggle}
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
