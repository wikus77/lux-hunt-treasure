// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Sicurezza - Section Modal Content (Revolut-style glass design)
import React, { useState } from 'react';
import { X, Shield, Key, LogOut, Eye, EyeOff, AlertTriangle, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySectionContentProps {
  onClose: () => void;
}

const SecuritySectionContent: React.FC<SecuritySectionContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateRecoveryKey = async () => {
    const key = Array.from({ length: 12 }, () => 
      Math.random().toString(36).substring(2, 6)
    ).join('-').toUpperCase();
    setRecoveryKey(key);
    
    if (!user) return;
    try {
      const hashedKey = btoa(key);
      await supabase.from('profiles').update({ recovery_key: hashedKey }).eq('id', user.id);
      toast({
        title: "✅ " + t('emergency_code_generated'),
        description: t('save_code_safely')
      });
    } catch (error) {
      console.error('Recovery key save error:', error);
    }
  };

  const copyRecoveryKey = () => {
    if (recoveryKey) {
      navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({ title: "❌ " + t('required_fields'), description: t('fill_all_fields'), variant: "destructive" });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast({ title: "❌ " + t('passwords_not_matching'), variant: "destructive" });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: "❌ " + t('password_too_short'), description: t('min_characters'), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: "✅ " + t('password_updated') });
    } catch (error: any) {
      toast({ title: "❌ " + t('error'), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      toast({ title: "❌ " + t('disconnect_error'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.8) 0%, rgba(20, 120, 60, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('security_title')}</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('security_subtitle')}</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Password Change */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key style={{ width: '20px', height: '20px', color: '#22C55E' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('change_password')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InputField 
              type={showPasswords ? 'text' : 'password'}
              placeholder={t('current_password')}
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
            />
            <InputField 
              type={showPasswords ? 'text' : 'password'}
              placeholder={t('new_password')}
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            />
            <InputField 
              type={showPasswords ? 'text' : 'password'}
              placeholder={t('confirm_new_password')}
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
            />
            
            <button onClick={() => setShowPasswords(!showPasswords)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}>
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPasswords ? t('hide_password') : t('show_password')}
            </button>

            <ActionButton onClick={handlePasswordChange} disabled={loading} color="#22C55E">
              {t('update_password')}
            </ActionButton>
          </div>
        </GlassCard>

        {/* Recovery Key */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('emergency_code')}</span>
          </div>

          {recoveryKey ? (
            <div>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <p style={{ color: '#F59E0B', fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}>{recoveryKey}</p>
              </div>
              <ActionButton onClick={copyRecoveryKey} color="#F59E0B">
                {copied ? <><Check size={16} /> {t('copied')}</> : <><Copy size={16} /> {t('copy_code')}</>}
              </ActionButton>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
                ⚠️ {t('emergency_code_warning')}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
                {t('emergency_code_description')}
              </p>
              <ActionButton onClick={generateRecoveryKey} color="#F59E0B">
                {t('generate_code')}
              </ActionButton>
            </div>
          )}
        </GlassCard>

        {/* Sign Out All */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <LogOut style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>{t('disconnect_everywhere')}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
            {t('disconnect_description')}
          </p>

          <ActionButton onClick={handleSignOutAll} disabled={loading} color="#EF4444">
            {t('disconnect_all_devices')}
          </ActionButton>
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Input Field
const InputField: React.FC<{ type: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ type, placeholder, value, onChange }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', outline: 'none' }} />
);

// Action Button
const ActionButton: React.FC<{ children: React.ReactNode; onClick: () => void; disabled?: boolean; color: string }> = ({ children, onClick, disabled, color }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: `${color}20`, border: `1px solid ${color}40`, color: color, fontSize: '14px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{children}</button>
);

export default SecuritySectionContent;
