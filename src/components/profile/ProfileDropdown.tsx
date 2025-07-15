// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useToast } from '@/hooks/use-toast';

interface ProfileDropdownProps {
  profileImage?: string | null;
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  profileImage, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "✅ Logout completato",
        description: "Sei stato disconnesso con successo.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "❌ Errore logout",
        description: "Impossibile disconnettersi. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  // Get user display name and email
  const displayName = user?.user_metadata?.full_name || 
                     `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||
                     'Joseph';
  const email = user?.email || 'wikus77@hotmail.it';
  const userId = user?.id ? user.id.substring(0, 8) : 'N/A';

  // Get subscription tier with badges
  const subscriptionTier = user?.user_metadata?.subscription_tier || 'm1ssion+';
  const getTierDisplay = () => {
    switch (subscriptionTier.toLowerCase()) {
      case 'black':
        return { name: 'Black', color: 'bg-gray-800 text-white', emoji: '⚫' };
      case 'elite':
        return { name: 'Elite', color: 'bg-amber-600 text-white', emoji: '🏆' };
      case 'm1ssion+':
        return { name: 'M1SSION+', color: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white', emoji: '👑' };
      default:
        return { name: 'M1SSION+', color: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white', emoji: '👑' };
    }
  };

  const tierInfo = getTierDisplay();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Avatar Button - 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ */}
      <Button
        variant="ghost"
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ProfileAvatar
          profileImage={profileImage}
          className="w-10 h-10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF] transition-colors"
        />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 z-[99999]"
            style={{
              top: 'calc(100% + 8px)',
              maxWidth: 'calc(100vw - 32px)',
              position: 'fixed',
              right: '16px'
            }}
          >
            <Card className="bg-black/95 border-[#00D1FF]/30 backdrop-blur-xl shadow-2xl border-2">
              <CardContent className="p-4 space-y-4">
                {/* User Info Section */}
                <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                  <ProfileAvatar
                    profileImage={profileImage}
                    className="w-12 h-12 border-2 border-[#00D1FF]/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-orbitron font-semibold text-white text-sm">
                      {displayName}
                    </h3>
                    <p className="text-white/70 text-xs">{email}</p>
                    <p className="text-white/50 text-xs">ID: {userId}</p>
                  </div>
                </div>

                {/* Subscription Tier */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Piano attivo:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${tierInfo.color}`}>
                    {tierInfo.emoji} {tierInfo.name}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/90 hover:bg-white/10"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Modifica profilo
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Esci
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;