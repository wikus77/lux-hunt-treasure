/**
 * Delete Account modal content — same style as M1U (Apple 5.1.1(v) + GDPR)
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeleteAccountModalContentProps {
  onClose: () => void;
}

export const DeleteAccountModalContent: React.FC<DeleteAccountModalContentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !understood) return;
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.access_token) {
      toast({ title: t('danger_zone'), description: 'Session expired. Please log in again.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.success !== true) throw new Error(data?.error || 'Deletion failed');
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deletion failed. Please try again or contact support.';
      toast({ title: t('danger_zone'), description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 20, 20, 0.95) 30%)',
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 16px)',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <X style={{ width: 20, height: 20, color: '#FFF' }} />
        </button>
        <h1
          style={{
            color: '#EF4444',
            fontSize: 18,
            fontWeight: 700,
            textAlign: 'center',
            flex: 1,
            textShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
          }}
        >
          {t('delete_account_modal_title')}
        </h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.5 }}>
        <p style={{ marginBottom: 12 }}>{t('delete_account_modal_irreversible')}</p>
        <p style={{ marginBottom: 12 }}>{t('delete_account_modal_account_deleted')}</p>
        <p style={{ marginBottom: 12 }}>{t('delete_account_modal_gdpr')}</p>
        <p style={{ marginBottom: 20 }}>{t('delete_account_modal_signed_out')}</p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: loading ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            disabled={loading}
            style={{ width: 20, height: 20, accentColor: '#EF4444' }}
          />
          <span>{t('delete_account_modal_understand_checkbox')}</span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleDelete}
            disabled={!understood || loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              background: understood && !loading ? '#EF4444' : 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#FFF',
              fontSize: 16,
              fontWeight: 600,
              cursor: understood && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} /> : <Trash2 style={{ width: 18, height: 18 }} />}
            {loading ? t('deleting') : t('delete_account_modal_cta_delete')}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModalContent;
