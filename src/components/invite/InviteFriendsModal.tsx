// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 👥 Invite Friends Modal — FULLSCREEN (identico a M1U Shop Modal)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Users, Copy, MessageCircle, Mail, Smartphone, Instagram, Video, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { HelpFlipOverlay } from '@/components/help/HelpFlipOverlay';
import { useAuthContext } from '@/contexts/auth';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose }) => {
  return (
    <HelpFlipOverlay
      open={isOpen}
      onClose={onClose}
      portalId="m1-invite-friends-portal"
      zIndex={99999}
    >
      <InviteFriendsContent onClose={onClose} />
    </HelpFlipOverlay>
  );
};

// Content component - mirrors existing InviteFriendModal content
const InviteFriendsContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuthContext();
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate referral link
  const referralLink = user?.id 
    ? `https://m1ssion.eu?ref=${user.id}`
    : `https://m1ssion.eu`;

  const inviteMessage = `🎮 Unisciti a M1SSION™ - La caccia al tesoro più epica! Usa il mio link per iniziare: ${referralLink}`;

  // Copy link to clipboard
  const copyReferralLink = async () => {
    hapticLight();
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      hapticSuccess();
      toast.success('Link copiato! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Errore durante la copia');
    }
  };

  // Share via Web Share API
  const shareInvite = async () => {
    hapticLight();
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'M1SSION™ - Unisciti alla caccia!',
          text: 'Unisciti a M1SSION™ - La caccia al tesoro più epica!',
          url: referralLink
        });
        hapticSuccess();
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Errore durante la condivisione');
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      copyReferralLink();
    }
  };

  // Share handlers
  const shareWhatsApp = () => {
    hapticLight();
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`, '_blank');
  };

  const shareSMS = () => {
    hapticLight();
    window.open(`sms:?body=${encodeURIComponent(inviteMessage)}`);
  };

  const shareEmail = () => {
    hapticLight();
    window.open(`mailto:?subject=${encodeURIComponent('Unisciti a M1SSION™!')}&body=${encodeURIComponent(inviteMessage)}`);
  };

  const shareInstagram = async () => {
    hapticLight();
    await navigator.clipboard.writeText(inviteMessage);
    toast.success('Copiato! Incollalo su Instagram Stories 📸');
    window.open('instagram://story-camera', '_blank');
  };

  const shareTikTok = async () => {
    hapticLight();
    await navigator.clipboard.writeText(inviteMessage);
    toast.success('Copiato! Incollalo su TikTok 🎵');
    window.open('https://www.tiktok.com', '_blank');
  };

  const shareTelegram = () => {
    hapticLight();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎮 Unisciti a M1SSION™!')}`, '_blank');
  };

  const socialButtons = [
    { name: 'WhatsApp', icon: MessageCircle, onClick: shareWhatsApp, color: '#25D366' },
    { name: 'Instagram', icon: Instagram, onClick: shareInstagram, color: '#E1306C' },
    { name: 'TikTok', icon: Video, onClick: shareTikTok, color: '#010101' },
    { name: 'Telegram', icon: MessageCircle, onClick: shareTelegram, color: '#0088CC' },
    { name: 'SMS', icon: Smartphone, onClick: shareSMS, color: '#34C759' },
    { name: 'Email', icon: Mail, onClick: shareEmail, color: '#6366F1' },
  ];

  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* HEADER - Gradiente blu/viola */}
      <div 
        style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.35) 0%, rgba(139, 92, 246, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              color: '#FFFFFF', 
              fontSize: '22px', 
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}>
              INVITA AMICI
            </h1>
          </div>

          {/* Spacer */}
          <div style={{ width: '40px' }} />
        </div>

        {/* Hero icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
            position: 'relative',
          }}>
            <Users style={{ width: '36px', height: '36px', color: '#60A5FA' }} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <Sparkles style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '-4px', 
                width: '20px', 
                height: '20px', 
                color: '#FBBF24' 
              }} />
            </motion.div>
          </div>
        </motion.div>

        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '14px', 
          textAlign: 'center',
        }}>
          Condividi M1SSION™ e guadagna ricompense!
        </p>
      </div>

      {/* CONTENT */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(25, 25, 35, 0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '20px',
          }}
        >
          <p style={{ 
            color: 'rgba(96, 165, 250, 0.8)', 
            fontSize: '11px', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
          }}>
            Il tuo link personale
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              flex: 1, 
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '10px',
              padding: '12px',
            }}>
              <p style={{ 
                color: '#E0E0E0', 
                fontSize: '13px', 
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {referralLink}
              </p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyReferralLink}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: copied 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(59, 130, 246, 0.2)',
                border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check style={{ width: '22px', height: '22px', color: '#22C55E' }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy style={{ width: '22px', height: '22px', color: '#60A5FA' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Social Share Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '20px' }}
        >
          <p style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '11px', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Condividi tramite
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px',
          }}>
            {socialButtons.map((btn, idx) => (
              <motion.button
                key={btn.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={btn.onClick}
                style={{
                  background: 'rgba(25, 25, 35, 0.8)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${btn.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <btn.icon style={{ width: '22px', height: '22px', color: btn.color }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 500 }}>
                  {btn.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareInvite}
          disabled={isSharing}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            marginBottom: '20px',
          }}
        >
          <Share2 style={{ width: '20px', height: '20px' }} />
          {isSharing ? 'Condividendo...' : 'Altre opzioni'}
        </motion.button>

        {/* Reward Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(251, 191, 36, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '26px' }}>🎁</span>
          </div>
          <div>
            <p style={{ color: '#FBBF24', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
              Ricompensa Referral
            </p>
            <p style={{ color: 'rgba(251, 191, 36, 0.8)', fontSize: '13px' }}>
              Guadagna <span style={{ color: '#FBBF24', fontWeight: 700 }}>+25 PE</span> per ogni amico!
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p style={{ 
          color: 'rgba(255,255,255,0.3)', 
          fontSize: '11px', 
          textAlign: 'center',
          marginTop: '24px',
        }}>
          M1SSION™ • Più amici inviti, più guadagni
        </p>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
