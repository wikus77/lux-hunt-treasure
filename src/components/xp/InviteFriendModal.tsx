// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Share2, Users, Copy, MessageCircle, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface InviteFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuthContext();
  const [friendEmail, setFriendEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Generate referral link
  const referralLink = user?.id 
    ? `https://m1ssion.eu?ref=${user.id}`
    : `https://m1ssion.eu`;

  const inviteMessage = `🎮 Unisciti a M1SSION™ - La caccia al tesoro più epica! Usa il mio link per iniziare: ${referralLink}`;

  // Copy link to clipboard
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Link copiato negli appunti!');
    } catch (error) {
      toast.error('Errore durante la copia del link');
    }
  };

  // Share via Web Share API
  const shareInvite = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'M1SSION™ - Unisciti alla caccia!',
          text: 'Unisciti a M1SSION™ - La caccia al tesoro più epica!',
          url: referralLink
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Errore durante la condivisione');
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback to copy
      copyReferralLink();
    }
  };

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Share via SMS
  const shareSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(inviteMessage)}`;
    window.open(smsUrl);
  };

  // Share via Email
  const shareEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent('Unisciti a M1SSION™!')}&body=${encodeURIComponent(inviteMessage)}`;
    window.open(emailUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] border border-cyan-500/20">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="relative">
              <Users className="w-16 h-16 text-cyan-400" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="absolute -top-2 -right-2"
              >
                <Share2 className="w-6 h-6 text-cyan-300" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold gradient-text mb-2">
            🚀 Invita un Amico
          </DialogTitle>
          
          <p className="text-gray-300 text-sm">
            Condividi M1SSION™ e guadagna +25 XP quando si registrano!
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Il tuo link di invito:</label>
            <div className="flex space-x-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-800/50 border-gray-600/50 text-gray-300 text-sm"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="icon"
                className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/80"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">Condividi tramite:</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp */}
              <Button
                onClick={shareWhatsApp}
                variant="outline"
                className="flex items-center space-x-2 bg-green-600/20 border-green-500/50 text-green-200 hover:bg-green-600/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>

              {/* SMS */}
              <Button
                onClick={shareSMS}
                variant="outline"
                className="flex items-center space-x-2 bg-blue-600/20 border-blue-500/50 text-blue-200 hover:bg-blue-600/40"
              >
                <Smartphone className="w-4 h-4" />
                <span>SMS</span>
              </Button>

              {/* Email */}
              <Button
                onClick={shareEmail}
                variant="outline"
                className="flex items-center space-x-2 bg-purple-600/20 border-purple-500/50 text-purple-200 hover:bg-purple-600/40"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Button>

              {/* Web Share */}
              <Button
                onClick={shareInvite}
                disabled={isSharing}
                variant="outline"
                className="flex items-center space-x-2 bg-cyan-600/20 border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/40"
              >
                <Share2 className="w-4 h-4" />
                <span>{isSharing ? 'Condividi...' : 'Altro'}</span>
              </Button>
            </div>
          </div>

          {/* Reward Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-gradient-to-r from-yellow-900/40 to-yellow-700/40 rounded-lg border border-yellow-500/30"
          >
            <p className="text-yellow-200 text-sm font-medium">💰 Ricompensa Referral</p>
            <p className="text-yellow-300/80 text-xs">
              Riceverai +25 XP quando il tuo amico si registra usando il tuo link!
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/80"
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};