// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🎬 v4: Avatar trigger with FLIP overlay (nasce dall'icona, ritorna all'icona)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import AgentProfileFlipOverlay from '@/components/profile/AgentProfileFlipOverlay';
import AgentProfileContent from '@/components/profile/AgentProfileContent';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';

interface ProfileDropdownProps {
  profileImage?: string | null;
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  profileImage, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  // 🎬 FLIP: Cattura rect dell'icona al click
  const handleAvatarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    buttonClickFeedback();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOriginRect(rect);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Profile Avatar Button - triggers FLIP overlay */}
      <motion.div
        className={`cursor-pointer ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          onClick={handleAvatarClick}
        >
          <ProfileAvatar
            profileImage={profileImage}
            className="w-10 h-10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] transition-colors"
          />
        </Button>
      </motion.div>

      {/* 🎬 FLIP Overlay - nasce dall'icona */}
      <AgentProfileFlipOverlay
        open={isOpen}
        originRect={originRect}
        onClose={handleClose}
      >
        <AgentProfileContent
          profileImage={profileImage}
          onClose={handleClose}
        />
      </AgentProfileFlipOverlay>
    </>
  );
};

export default ProfileDropdown;
