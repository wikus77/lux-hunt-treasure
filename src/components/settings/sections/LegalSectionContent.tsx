// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Legale - Section Modal Content (Revolut-style glass design)
import React, { useState } from 'react';
import { X, FileText, Shield, Settings, Copyright, Award, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LegalSectionContentProps {
  onClose: () => void;
}

const LegalSectionContent: React.FC<LegalSectionContentProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const legalLinks = [
    { title: 'Termini di Servizio', description: "Condizioni d'uso dell'applicazione", url: '/terms', icon: FileText },
    { title: 'Privacy Policy', description: 'Come raccogliamo e utilizziamo i tuoi dati', url: '/privacy-policy', icon: Shield },
    { title: 'Cookie Policy', description: 'Come utilizziamo i cookie', url: '/cookie-policy', icon: Settings },
    { title: 'Regolamento M1SSION™', description: 'Modalità di gioco, premi, meccaniche', url: '/game-rules', icon: FileText },
    { title: 'Game Policies', description: 'Disclaimers, virtual currencies', url: '/policies', icon: Shield },
    { title: 'SafeCreative', description: 'Certificazione proprietà intellettuale', url: '/safecreative', icon: Copyright },
    { title: 'EUIPO – Marchio Registrato', description: 'Registrazione marchio EU', url: '/euipo', icon: Award },
  ];

  const openLink = (url: string) => {
    if ((window as any).Capacitor) {
      (window as any).Capacitor.Plugins.Browser?.open({ url: window.location.origin + url });
    } else {
      window.open(url, '_blank');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from('user_clues').delete().eq('user_id', user.id);
      await supabase.from('user_buzz_counter').delete().eq('user_id', user.id);
      await supabase.from('user_notifications').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      localStorage.clear();
      toast({ title: "✅ Account eliminato" });
      window.location.href = '/login';
    } catch (error: any) {
      toast({ title: "❌ Errore eliminazione", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.8) 0%, rgba(150, 40, 100, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>LEGALE</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Termini, privacy e account</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Legal Documents */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText style={{ width: '20px', height: '20px', color: '#EC4899' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Documenti Legali</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {legalLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => openLink(link.url)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon style={{ width: '18px', height: '18px', color: '#00D1FF' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{link.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{link.description}</p>
                    </div>
                  </div>
                  <ExternalLink style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.3)' }} />
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* App Info */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Informazioni App</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InfoBox label="Versione" value="2.1.0" />
            <InfoBox label="Build" value="2025.12.05" />
            <InfoBox label="Sviluppatore" value="NIYVORA KFT™" />
            <InfoBox label="Copyright" value="M1SSION™ 2025" />
          </div>

          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(0, 209, 255, 0.1)', border: '1px solid rgba(0, 209, 255, 0.2)' }}>
            <p style={{ color: '#00D1FF', fontSize: '12px' }}>
              M1SSION™ è un'app ufficiale creata e sviluppata da NIYVORA KFT™.
            </p>
          </div>
        </GlassCard>

        {/* Contact */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
              Hai domande o hai bisogno di assistenza?
            </p>
            <button
              onClick={() => window.location.href = 'mailto:contact@m1ssion.com?subject=M1SSION%20Support'}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'rgba(0, 209, 255, 0.15)',
                border: '1px solid rgba(0, 209, 255, 0.3)',
                color: '#00D1FF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Contatta il Supporto
            </button>
          </div>
        </GlassCard>

        {/* Delete Account */}
        <GlassCard style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trash2 style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            <span style={{ color: '#EF4444', fontSize: '16px', fontWeight: 600 }}>Zona Pericolosa</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
            ⚠️ L'eliminazione dell'account è permanente e irreversibile.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Elimina Account Permanentemente
            </button>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#EF4444' }} />
                <span style={{ color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>Sei sicuro?</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '16px' }}>
                Tutti i tuoi dati, progressi e abbonamenti verranno eliminati definitivamente.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#EF4444', border: 'none', color: '#FFFFFF', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? 'Eliminando...' : 'Conferma Eliminazione'}
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Info Box
const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
    <p style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{value}</p>
  </div>
);

export default LegalSectionContent;
