
// FILE CREATO O MODIFICATO — BY JOSEPH MULE
import React from 'react';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import ReferralCodeDisplay from '@/components/layout/header/ReferralCodeDisplay';
import { Link } from 'wouter';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileDropdown from '@/components/profile/ProfileDropdown';
import { useProfileImage } from '@/hooks/useProfileImage';

const MapPageHeader: React.FC = () => {
  const { shouldHideHeader } = useScrollDirection(50, '#map-scroll-container');
  const { profileImage } = useProfileImage();
  const [isPWA, setIsPWA] = React.useState(false);

  React.useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
  }, []);
  
  return (
    <div className="relative w-full h-full">
      {/* Background e bordi - fade out on scroll */}
      <motion.div
        className="absolute inset-0 backdrop-blur-xl rounded-b-lg"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 209, 255, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 209, 255, 0.18), 0 2px 12px rgba(0, 209, 255, 0.12), inset 0 -1px 0 rgba(0, 209, 255, 0.12)',
        }}
        animate={{ opacity: shouldHideHeader ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative container mx-auto h-full max-w-screen-xl">
        <div className="flex items-center justify-between h-[72px] px-3 sm:px-4">
          {/* Left - M1SSION logo - fade out on scroll */}
          <motion.div
            className="flex items-center"
            animate={{ opacity: shouldHideHeader ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/home"
              className="text-xl sm:text-2xl font-orbitron font-bold"
            >
              <span className="text-[#00D1FF]" style={{ 
                textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
              }}>M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </Link>
          </motion.div>

          {/* Center - Agent Code - SEMPRE VISIBILE, NON SI MUOVE */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-[#00D1FF] rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: "0 0 8px rgba(0, 209, 255, 0.6), 0 0 16px rgba(0, 209, 255, 0.4)"
                }}
              />
              <span 
                className="text-xs font-orbitron font-bold text-white tracking-wider"
                style={{
                  textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
                }}
              >
                CODE
              </span>
            </div>
            <ReferralCodeDisplay />
          </div>

          {/* Right - Settings & Profile - fade out on scroll */}
          <motion.div
            className="flex items-center space-x-1 sm:space-x-3"
            animate={{ opacity: shouldHideHeader ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 209, 255, 0.4))"
                  }}
                >
                  <Settings className="w-5 h-5 text-[#00D1FF]" />
                </motion.div>
              </Button>
            </Link>

            <ProfileDropdown
              profileImage={profileImage}
              className="cursor-pointer"
            />
          </motion.div>
        </div>

        {/* Line glow - fade out on scroll */}
        <motion.div
          className="line-glow absolute bottom-0 left-0 w-full"
          animate={{ opacity: shouldHideHeader ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
};

export default MapPageHeader;
