// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Share Achievement Modal Component

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Share2, MessageCircle, Instagram, Video, Copy, Twitter, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { 
  shareAchievement, 
  generateAchievementMessage, 
  copyToClipboard,
  type AchievementShare 
} from '@/utils/socialShare';
import { hapticSuccess } from '@/utils/haptics';

interface ShareAchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: AchievementShare;
}

export const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({
  open,
  onOpenChange,
  achievement
}) => {
  const handleShare = async (platform: 'native' | 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'copy') => {
    const success = await shareAchievement(achievement, platform);
    
    if (success && platform === 'copy') {
      toast.success('Achievement copiato! 📋');
    } else if (success) {
      hapticSuccess();
    }
  };

  const handleInstagram = async () => {
    const message = generateAchievementMessage(achievement);
    await copyToClipboard(message);
    toast.success('Copiato! Incollalo nelle tue Instagram Stories 📸');
    window.open('instagram://story-camera', '_blank');
  };

  const handleTikTok = async () => {
    const message = generateAchievementMessage(achievement);
    await copyToClipboard(message);
    toast.success('Copiato! Incollalo nel tuo TikTok 🎵');
    window.open('https://www.tiktok.com', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] border border-yellow-500/30">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center mb-4"
          >
            <div className="text-5xl mb-2">{achievement.achievementIcon || '🏆'}</div>
            <DialogTitle className="text-xl font-bold text-yellow-300">
              {achievement.achievementName}
            </DialogTitle>
            
            {/* Rewards */}
            <div className="flex gap-3 mt-2">
              {achievement.xpEarned && (
                <span className="px-2 py-1 bg-purple-600/30 rounded-full text-purple-300 text-xs">
                  +{achievement.xpEarned} XP
                </span>
              )}
              {achievement.m1uEarned && (
                <span className="px-2 py-1 bg-cyan-600/30 rounded-full text-cyan-300 text-xs">
                  +{achievement.m1uEarned} M1U
                </span>
              )}
            </div>
          </motion.div>
          
          <p className="text-gray-400 text-sm">
            Condividi il tuo achievement! 🎉
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Social Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <Button
              onClick={() => handleShare('whatsapp')}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-green-600/20 border-green-500/50 text-green-200 hover:bg-green-600/40"
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>

            {/* Instagram */}
            <Button
              onClick={handleInstagram}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-pink-500/50 text-pink-200 hover:from-purple-600/40 hover:to-pink-600/40"
            >
              <Instagram className="w-5 h-5 mb-1" />
              <span className="text-xs">Instagram</span>
            </Button>

            {/* TikTok */}
            <Button
              onClick={handleTikTok}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-gray-800/40 border-gray-500/50 text-gray-200 hover:bg-gray-700/60"
            >
              <Video className="w-5 h-5 mb-1" />
              <span className="text-xs">TikTok</span>
            </Button>

            {/* Twitter */}
            <Button
              onClick={() => handleShare('twitter')}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-blue-500/20 border-blue-400/50 text-blue-200 hover:bg-blue-500/40"
            >
              <Twitter className="w-5 h-5 mb-1" />
              <span className="text-xs">Twitter</span>
            </Button>

            {/* Facebook */}
            <Button
              onClick={() => handleShare('facebook')}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-blue-600/20 border-blue-500/50 text-blue-200 hover:bg-blue-600/40"
            >
              <Facebook className="w-5 h-5 mb-1" />
              <span className="text-xs">Facebook</span>
            </Button>

            {/* Copy */}
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-gray-600/20 border-gray-500/50 text-gray-200 hover:bg-gray-600/40"
            >
              <Copy className="w-5 h-5 mb-1" />
              <span className="text-xs">Copia</span>
            </Button>
          </div>

          {/* Native Share Button */}
          <Button
            onClick={() => handleShare('native')}
            className="w-full bg-gradient-to-r from-yellow-600/40 to-orange-600/40 border border-yellow-500/50 text-yellow-100 hover:from-yellow-600/60 hover:to-orange-600/60"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Altre opzioni
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-gray-400 hover:text-gray-200"
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAchievementModal;


