// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Social Share Utility for M1SSION™

import { hapticLight, hapticSuccess } from './haptics';

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export interface AchievementShare {
  achievementName: string;
  achievementIcon?: string;
  xpEarned?: number;
  m1uEarned?: number;
  level?: number;
  customMessage?: string;
}

// Base URL for the app
const APP_URL = 'https://m1ssion.eu';

/**
 * Generate share message for achievement
 */
export const generateAchievementMessage = (achievement: AchievementShare): string => {
  const emoji = achievement.achievementIcon || '🏆';
  const xp = achievement.xpEarned ? `+${achievement.xpEarned} XP` : '';
  const m1u = achievement.m1uEarned ? `+${achievement.m1uEarned} M1U` : '';
  const level = achievement.level ? `Livello ${achievement.level}` : '';
  
  const rewards = [xp, m1u, level].filter(Boolean).join(' | ');
  
  return achievement.customMessage || 
    `${emoji} Ho sbloccato "${achievement.achievementName}" su M1SSION™! ${rewards ? `\n${rewards}` : ''}\n\n🎮 Unisciti alla caccia al tesoro: ${APP_URL}\n\n#M1SSION #CacciaAlTesoro #Gaming`;
};

/**
 * Share via Web Share API (native share dialog)
 */
export const shareNative = async (content: ShareContent): Promise<boolean> => {
  hapticLight();
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url || APP_URL
      });
      hapticSuccess();
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[Share] Native share failed:', error);
      }
      return false;
    }
  }
  return false;
};

/**
 * Share via WhatsApp
 */
export const shareWhatsApp = (message: string): void => {
  hapticLight();
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

/**
 * Share via Telegram
 */
export const shareTelegram = (message: string, url?: string): void => {
  hapticLight();
  const telegramUrl = url 
    ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`
    : `https://t.me/share/url?text=${encodeURIComponent(message)}`;
  window.open(telegramUrl, '_blank');
};

/**
 * Share via Twitter/X
 */
export const shareTwitter = (message: string, hashtags?: string[]): void => {
  hapticLight();
  const hashtagStr = hashtags?.join(',') || 'M1SSION,CacciaAlTesoro';
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&hashtags=${hashtagStr}`;
  window.open(url, '_blank');
};

/**
 * Share via Facebook
 */
export const shareFacebook = (url?: string): void => {
  hapticLight();
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || APP_URL)}`;
  window.open(shareUrl, '_blank');
};

/**
 * Copy to clipboard and show toast
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  hapticLight();
  try {
    await navigator.clipboard.writeText(text);
    hapticSuccess();
    return true;
  } catch (error) {
    console.error('[Share] Clipboard copy failed:', error);
    return false;
  }
};

/**
 * Share achievement with multiple options
 */
export const shareAchievement = async (
  achievement: AchievementShare,
  platform: 'native' | 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'copy'
): Promise<boolean> => {
  const message = generateAchievementMessage(achievement);
  
  switch (platform) {
    case 'native':
      return shareNative({
        title: `M1SSION™ - ${achievement.achievementName}`,
        text: message,
        url: APP_URL
      });
    
    case 'whatsapp':
      shareWhatsApp(message);
      return true;
    
    case 'telegram':
      shareTelegram(message, APP_URL);
      return true;
    
    case 'twitter':
      shareTwitter(message, ['M1SSION', 'CacciaAlTesoro', 'Gaming']);
      return true;
    
    case 'facebook':
      shareFacebook(APP_URL);
      return true;
    
    case 'copy':
      return copyToClipboard(message);
    
    default:
      return false;
  }
};

/**
 * Open Instagram (no direct share API available for web)
 */
export const openInstagram = (): void => {
  hapticLight();
  // Try deep link first, fallback to web
  window.open('instagram://app', '_blank');
  setTimeout(() => {
    window.open('https://www.instagram.com', '_blank');
  }, 500);
};

/**
 * Open TikTok (no direct share API available for web)
 */
export const openTikTok = (): void => {
  hapticLight();
  window.open('https://www.tiktok.com', '_blank');
};

export default {
  generateAchievementMessage,
  shareNative,
  shareWhatsApp,
  shareTelegram,
  shareTwitter,
  shareFacebook,
  copyToClipboard,
  shareAchievement,
  openInstagram,
  openTikTok
};


