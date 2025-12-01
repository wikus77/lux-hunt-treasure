// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Copy, MessageCircle, Mail, Smartphone, Instagram, Video, X, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

interface InviteFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  open,
  onOpenChange
}) => {
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
    { name: 'WhatsApp', icon: MessageCircle, onClick: shareWhatsApp, gradient: 'from-green-500 to-green-600', glow: 'shadow-green-500/30' },
    { name: 'Instagram', icon: Instagram, onClick: shareInstagram, gradient: 'from-purple-500 via-pink-500 to-orange-400', glow: 'shadow-pink-500/30' },
    { name: 'TikTok', icon: Video, onClick: shareTikTok, gradient: 'from-gray-700 to-gray-900', glow: 'shadow-white/10' },
    { name: 'Telegram', icon: MessageCircle, onClick: shareTelegram, gradient: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/30' },
    { name: 'SMS', icon: Smartphone, onClick: shareSMS, gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/30' },
    { name: 'Email', icon: Mail, onClick: shareEmail, gradient: 'from-purple-500 to-indigo-600', glow: 'shadow-purple-500/30' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] sm:max-w-[380px] p-0 border-0 bg-transparent overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative"
        >
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
          
          {/* Main container */}
          <div className="relative bg-gradient-to-br from-[#0a0e17] via-[#111827] to-[#0a0e17] rounded-2xl border border-cyan-500/20 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />
            </div>
            
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Header */}
            <div className="relative pt-8 pb-4 px-6 text-center">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                className="relative inline-flex mb-4"
              >
                {/* Glow rings */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl"
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Users className="w-10 h-10 text-cyan-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold font-orbitron mb-2"
              >
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Invita un Amico
                </span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-sm"
              >
                Condividi M1SSION™ e guadagna ricompense!
              </motion.p>
            </div>
            
            {/* Referral Link */}
            <div className="px-6 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-cyan-500/20">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-0.5">Il tuo link</p>
                    <p className="text-sm text-gray-300 truncate font-mono">{referralLink}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={copyReferralLink}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      copied 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-5 h-5 text-green-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="w-5 h-5 text-cyan-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            {/* Social Buttons Grid */}
            <div className="px-6 pb-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs text-gray-500 uppercase tracking-wider mb-3"
              >
                Condividi tramite
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-2"
              >
                {socialButtons.map((btn, idx) => (
                  <motion.button
                    key={btn.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={btn.onClick}
                    className={`relative group flex flex-col items-center justify-center h-[70px] rounded-xl bg-gradient-to-br ${btn.gradient} p-[1px] overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-full h-full rounded-[11px] bg-[#0a0e17]/80 flex flex-col items-center justify-center">
                      <btn.icon className="w-6 h-6 text-white mb-1.5" />
                      <span className="text-[10px] text-gray-300 font-medium">{btn.name}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
            
            {/* Web Share Button */}
            <div className="px-6 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={shareInvite}
                  disabled={isSharing}
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 border-0"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {isSharing ? 'Condividendo...' : 'Altre opzioni'}
                </Button>
              </motion.div>
            </div>
            
            {/* Reward Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mx-6 mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-300 font-semibold text-sm">Ricompensa Referral</p>
                  <p className="text-yellow-200/70 text-xs">
                    Guadagna <span className="text-yellow-400 font-bold">+25 PE</span> per ogni amico!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
