// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Metodi di Pagamento - Section Modal Content (Revolut-style glass design)
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Plus, Smartphone, Shield, Trash2, Star, CheckCircle, ArrowLeft, Lock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SettingsSectionFlipOverlay } from '../SettingsSectionFlipOverlay';

interface PaymentMethodsSectionContentProps {
  onClose: () => void;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(navigator.userAgent);

const PaymentMethodsSectionContent: React.FC<PaymentMethodsSectionContentProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // State per modal aggiungi carta
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [addCardOriginRect, setAddCardOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (user) loadPaymentMethods();
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplePaySetup = () => {
    toast({ title: "🍎 Apple Pay", description: "La configurazione sarà disponibile a breve." });
  };

  const handleGooglePaySetup = () => {
    toast({ title: "🤖 Google Pay", description: "La configurazione sarà disponibile a breve." });
  };

  const handleAddCard = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAddCardOriginRect(rect);
    setShowAddCardModal(true);
  };

  const handleSetDefault = async (cardId: string) => {
    if (!user) return;
    try {
      await supabase.from('user_payment_methods').update({ is_default: false }).eq('user_id', user.id);
      await supabase.from('user_payment_methods').update({ is_default: true }).eq('id', cardId);
      toast({ title: "✅ Carta predefinita impostata" });
      loadPaymentMethods();
    } catch (error) {
      toast({ title: "❌ Errore", variant: "destructive" });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    try {
      await supabase.from('user_payment_methods').delete().eq('id', cardId);
      toast({ title: "✅ Carta eliminata" });
      loadPaymentMethods();
    } catch (error) {
      toast({ title: "❌ Errore eliminazione", variant: "destructive" });
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '#1A1F71';
      case 'mastercard': return '#EB001B';
      case 'amex': return '#006FCF';
      default: return '#6366F1';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {/* HEADER */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(20, 184, 166, 0.8) 0%, rgba(10, 100, 90, 0.6) 100%)',
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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>PAGAMENTI</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Carte, Apple Pay, Google Pay</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Digital Wallets */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Smartphone style={{ width: '20px', height: '20px', color: '#14B8A6' }} />
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Wallet Digitali</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isIOS && (
              <WalletButton 
                icon="🍎" 
                label="Apple Pay" 
                status="Non configurato"
                onClick={handleApplePaySetup}
              />
            )}
            {isAndroid && (
              <WalletButton 
                icon="🤖" 
                label="Google Pay" 
                status="Non configurato"
                onClick={handleGooglePaySetup}
              />
            )}
            {!isIOS && !isAndroid && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center' }}>
                I wallet digitali sono disponibili solo su dispositivi mobili.
              </p>
            )}
          </div>
        </GlassCard>

        {/* Cards */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#6366F1' }} />
              <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>Le Tue Carte</span>
            </div>
            <button onClick={(e) => handleAddCard(e)} style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#6366F1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Aggiungi
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : paymentMethods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CreditCard style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Nessuna carta salvata</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>Aggiungi una carta per pagamenti rapidi</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentMethods.map((card) => (
                <CardItem 
                  key={card.id}
                  card={card}
                  brandColor={getBrandColor(card.brand)}
                  onSetDefault={() => handleSetDefault(card.id)}
                  onDelete={() => handleDeleteCard(card.id)}
                />
              ))}
            </div>
          )}
        </GlassCard>

        {/* Security Note */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Shield style={{ width: '20px', height: '20px', color: '#22C55E', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Pagamenti Sicuri</h4>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                Tutti i pagamenti sono elaborati tramite Stripe con crittografia bancaria. Non conserviamo mai i dati completi della tua carta.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add Card Modal */}
      <SettingsSectionFlipOverlay
        open={showAddCardModal}
        originRect={addCardOriginRect}
        onClose={() => setShowAddCardModal(false)}
      >
        <AddCardModalContent onClose={() => setShowAddCardModal(false)} onCardAdded={loadPaymentMethods} />
      </SettingsSectionFlipOverlay>
    </div>
  );
};

// Add Card Modal Content
const AddCardModalContent: React.FC<{ onClose: () => void; onCardAdded: () => void }> = ({ onClose, onCardAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      toast({ title: "❌ Compila tutti i campi", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // In production, this would call Stripe to tokenize the card
      // For now, we'll simulate saving the last 4 digits
      const last4 = cardData.number.replace(/\s/g, '').slice(-4);
      const [month, year] = cardData.expiry.split('/');
      
      // Detect card brand from number
      const firstDigit = cardData.number.charAt(0);
      let brand = 'Unknown';
      if (firstDigit === '4') brand = 'Visa';
      else if (firstDigit === '5') brand = 'Mastercard';
      else if (firstDigit === '3') brand = 'Amex';

      if (user) {
        const { error } = await supabase.from('user_payment_methods').insert({
          user_id: user.id,
          brand,
          last4,
          exp_month: parseInt(month),
          exp_year: 2000 + parseInt(year),
          is_default: false,
          stripe_pm_id: `pm_demo_${Date.now()}`
        });

        if (error) throw error;
      }

      toast({ title: "✅ Carta aggiunta con successo" });
      onCardAdded();
      onClose();
    } catch (error: any) {
      toast({ title: "❌ Errore", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>AGGIUNGI CARTA</h1>
          </div>
          <div style={{ width: '40px' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Inserisci i dati della tua carta</p>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
        <GlassCard style={{ marginBottom: '16px' }}>
          {/* Card Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <CreditCard size={32} color="rgba(255,255,255,0.3)" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '8px' }}>NUMERO CARTA</p>
            <p style={{ color: '#FFFFFF', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '16px' }}>
              {cardData.number || '•••• •••• •••• ••••'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px' }}>TITOLARE</p>
                <p style={{ color: '#FFFFFF', fontSize: '12px' }}>{cardData.name || 'NOME COGNOME'}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px' }}>SCADENZA</p>
                <p style={{ color: '#FFFFFF', fontSize: '12px' }}>{cardData.expiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                <CreditCard size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Numero Carta
              </label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Scadenza
                </label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                  placeholder="MM/YY"
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                  <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  CVC
                </label>
                <input
                  type="text"
                  value={cardData.cvc}
                  onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                  placeholder="123"
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                Nome Titolare
              </label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                placeholder="NOME COGNOME"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Security Note */}
        <GlassCard style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Shield style={{ width: '20px', height: '20px', color: '#22C55E', flexShrink: 0 }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              I tuoi dati sono protetti con crittografia SSL e non vengono mai memorizzati sui nostri server.
            </p>
          </div>
        </GlassCard>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          }}
        >
          {loading ? 'Salvataggio...' : 'Aggiungi Carta'}
        </button>
      </div>
    </div>
  );
};

// Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

// Wallet Button
const WalletButton: React.FC<{ icon: string; label: string; status: string; onClick: () => void }> = ({ icon, label, status, onClick }) => (
  <button onClick={onClick} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{status}</span>
  </button>
);

// Card Item
const CardItem: React.FC<{ card: PaymentMethod; brandColor: string; onSetDefault: () => void; onDelete: () => void }> = ({ card, brandColor, onSetDefault, onDelete }) => (
  <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '40px', height: '28px', borderRadius: '4px', background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CreditCard size={16} color="#FFFFFF" />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500 }}>•••• {card.last4}</span>
          {card.is_default && <Star size={14} color="#F59E0B" fill="#F59E0B" />}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{card.exp_month}/{card.exp_year}</span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      {!card.is_default && (
        <button onClick={onSetDefault} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', border: 'none', cursor: 'pointer' }}>
          <CheckCircle size={16} color="#22C55E" />
        </button>
      )}
      <button onClick={onDelete} style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', cursor: 'pointer' }}>
        <Trash2 size={16} color="#EF4444" />
      </button>
    </div>
  </div>
);

export default PaymentMethodsSectionContent;
