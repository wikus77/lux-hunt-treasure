// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🔧 v3: Avatar trigger that opens ProfileBottomSheet from bottom
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileBottomSheet from '@/components/profile/ProfileBottomSheet';

interface ProfileDropdownProps {
  profileImage?: string | null;
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  profileImage, 
  className = "" 
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <>
      {/* Profile Avatar Button - triggers bottom sheet */}
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

      {/* Bottom Sheet Portal */}
      <ProfileBottomSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        profileImage={profileImage}
      />
    </>
  );
};

export default ProfileDropdown;
