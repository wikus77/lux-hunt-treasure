// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎨 M1U Shop Content - REVOLUT STYLE (identico design a SettingsContent)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Sparkles, Zap, Crown, Gem, Star } from 'lucide-react';
import { M1UPaymentModal } from './M1UPaymentModal';

interface M1UShopContentProps {
  onClose: () => void;
}

interface M1UPack {
  id: string;
  name: string;
  code: 'M1U_STARTER' | 'M1U_AGENT' | 'M1U_ELITE' | 'M1U_COMMANDER' | 'M1U_DIRECTOR' | 'M1U_MASTER';
  m1u_total: number;
  euro: number;
  savePct: number;
  icon: any;
  color: string;
}

const M1U_PACKS: M1UPack[] = [
  { 
    id: 'starter', 
    name: 'Starter Pack', 
    code: 'M1U_STARTER',
    m1u_total: 50, 
    euro: 4.99, 
    savePct: 0,
    icon: Sparkles,
    color: '#00D1FF'
  },
  { 
    id: 'agent', 
    name: 'Agent Pack', 
    code: 'M1U_AGENT',
    m1u_total: 110, 
    euro: 9.99, 
    savePct: 9,
    icon: Zap,
    color: '#22C55E'
  },
  { 
    id: 'elite', 
    name: 'Elite Pack', 
    code: 'M1U_ELITE',
    m1u_total: 250, 
    euro: 19.99, 
    savePct: 20,
    icon: Star,
    color: '#F59E0B'
  },
  { 
    id: 'commander', 
    name: 'Commander Pack', 
    code: 'M1U_COMMANDER',
    m1u_total: 550, 
    euro: 39.99, 
    savePct: 27,
    icon: Crown,
    color: '#A855F7'
  },
  { 
    id: 'director', 
    name: 'Director Pack', 
    code: 'M1U_DIRECTOR',
    m1u_total: 1200, 
    euro: 79.99, 
    savePct: 33,
    icon: Gem,
    color: '#EC4899'
  },
  { 
    id: 'mcp', 
    name: 'Master Control', 
    code: 'M1U_MASTER',
    m1u_total: 3000, 
    euro: 199.99, 
    savePct: 33,
    icon: Crown,
    color: '#FFD700'
  }
];

export const M1UShopContent: React.FC<M1UShopContentProps> = ({ onClose }) => {
  const [selectedPack, setSelectedPack] = useState<M1UPack | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePurchase = (pack: M1UPack) => {
    // 🚨 FORENSIC — REMOVE AFTER DEBUG
    console.log('🚨🚨🚨 IAP_DIAG_ACQUISTA_CLICK 🚨🚨🚨');
    console.log('[M1U SHOP] 🛒 Purchase initiated:', {
      packCode: pack.code,
      packName: pack.name,
      priceEUR: pack.euro,
      priceCents: Math.round(pack.euro * 100),
      m1u: pack.m1u_total
    });

    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('checkout_start', { props: { pack: pack.id } });
    }

    setSelectedPack(pack);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    console.log('[M1U SHOP] Payment successful for:', selectedPack?.code);
    setShowPaymentModal(false);
    
    if (selectedPack) {
      console.log('[M1U SHOP] Emitting m1u-credited event with amount:', selectedPack.m1u_total);
      window.dispatchEvent(new CustomEvent('m1u-credited', {
        detail: { 
          amount: selectedPack.m1u_total,
          packCode: selectedPack.code,
          packName: selectedPack.name
        }
      }));
      
      window.dispatchEvent(new CustomEvent('m1u-balance-changed', {
        detail: { 
          type: 'purchase',
          amount: selectedPack.m1u_total 
        }
      }));
    }
    
    setSelectedPack(null);
    onClose();
  };

  const handlePaymentCancel = () => {
    console.log('[M1U SHOP] Payment cancelled');
    setShowPaymentModal(false);
    setSelectedPack(null);
  };

  return (
    <>
      <div 
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {/* HEADER - Gradiente oro/viola come M1U */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.3) 0%, rgba(124, 58, 237, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            {/* X button */}
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>

            {/* Title */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ 
                color: '#FFD700', 
                fontSize: '20px', 
                fontWeight: 700,
                letterSpacing: '1px',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
              }}>
                M1 UNITS™ SHOP
              </h1>
            </div>

            {/* Spacer */}
            <div style={{ width: '40px' }} />
          </div>

          {/* Subtitle */}
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '13px', 
            textAlign: 'center',
          }}>
            Acquista M1U per sbloccare indizi e funzionalità premium
          </p>
        </div>

        {/* CONTENT - Packs Grid */}
        <div 
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Packs Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            marginBottom: '16px',
          }}>
            {M1U_PACKS.map((pack, index) => {
              const Icon = pack.icon;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard 
                    onClick={() => handlePurchase(pack)}
                    style={{ position: 'relative', padding: '14px' }}
                  >
                    {/* Save Badge */}
                    {pack.savePct > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: '#22c55e',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 700,
                        boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)',
                      }}>
                        -{pack.savePct}%
                      </div>
                    )}

                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${pack.color}40, ${pack.color}20)`,
                      boxShadow: `0 0 20px ${pack.color}40`,
                    }}>
                      <Icon style={{ width: '24px', height: '24px', color: pack.color }} />
                    </div>

                    {/* Pack Name */}
                    <p style={{ 
                      color: '#FFFFFF', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      textAlign: 'center',
                      marginBottom: '8px',
                    }}>
                      {pack.name}
                    </p>

                    {/* M1U Amount */}
                    <p style={{ 
                      color: '#FFFFFF', 
                      fontSize: '24px', 
                      fontWeight: 800, 
                      textAlign: 'center',
                      marginBottom: '4px',
                    }}>
                      {pack.m1u_total}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>M1U</span>
                    </p>

                    {/* Price */}
                    <p style={{ 
                      color: '#FFD700', 
                      fontSize: '18px', 
                      fontWeight: 700, 
                      textAlign: 'center',
                      marginBottom: '12px',
                    }}>
                      €{pack.euro.toFixed(2)}
                    </p>

                    {/* Buy Button */}
                    <button
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00D1FF, #7C3AED)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <ShoppingCart style={{ width: '14px', height: '14px' }} />
                      Acquista
                    </button>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '11px', 
            textAlign: 'center',
            marginTop: '8px',
          }}>
            Pagamento sicuro tramite Apple Pay • M1U non scadono mai
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPack && (
        <M1UPaymentModal
          isOpen={showPaymentModal}
          packName={selectedPack.name}
          packCode={selectedPack.code}
          m1uAmount={selectedPack.m1u_total}
          priceEur={selectedPack.euro}
          priceCents={Math.round(selectedPack.euro * 100)}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  );
};

// GLASS CARD - REVOLUT STYLE
const GlassCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(25, 25, 35, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '14px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

export default M1UShopContent;
