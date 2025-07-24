// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT™
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Target, Clock, Copy, X, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReferralCode } from '@/hooks/useReferralCode';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/auth';
import { useLocation } from 'wouter';

interface ProfileToastProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface ProfileData {
  username: string;
  email: string;
  cluesFound: number;
  totalClues: number;
  daysRemaining: number;
  missionStartDate: string;
  subscriptionTier: string;
}

const ProfileToast: React.FC<ProfileToastProps> = ({ isOpen, onClose, className }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { referralCode, copyReferralCode } = useReferralCode();
  const { toast } = useToast();
  const { logout } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, subscription_tier')
        .eq('id', user.id)
        .single();

      // Fetch mission status
      const { data: missionStatus } = await supabase
        .from('user_mission_status')
        .select('clues_found, mission_started_at, mission_days_remaining')
        .eq('user_id', user.id)
        .single();

      // Fetch subscription data with prioritized logic
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // 🔑 M1SSION™ FINAL SUBSCRIPTION SYNC - Use unified source
      let userTier = subscription?.tier || profile?.subscription_tier || 'Base';
      
      // REMOVED: Developer override to maintain consistency with main subscription logic
      // The subscription should be managed via useProfileSubscription hook only
      console.log('📋 M1SSION™ ProfileToast Using unified tier:', userTier);
      
      console.log('📋 M1SSION™ ProfileToast Final unified tier:', userTier);

      setProfileData({
        username: profile?.username || profile?.full_name || 'Agente',
        email: user.email || '',
        cluesFound: missionStatus?.clues_found || 0,
        totalClues: 12, // Total clues in the mission
        daysRemaining: missionStatus?.mission_days_remaining || 30,
        missionStartDate: missionStatus?.mission_started_at || new Date().toISOString(),
        subscriptionTier: userTier
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'black': return '#1a1a1a';
      case 'titanium': return '#a855f7'; // Purple for Titanium
      default: return '#ffffff';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'titanium': return '0 0 20px rgba(168, 85, 247, 0.5)';
      default: return 'none';
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      setLocation('/login');
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo"
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUpgrade = () => {
    onClose();
    setLocation('/subscriptions');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Toast */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed top-20 right-4 w-80 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 ${className}`}
            style={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-orbitron font-bold text-white">Profilo Agente</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : profileData ? (
                <>
                  {/* Username */}
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Nome utente:</span>
                    <span className="text-white font-medium">{profileData.username}</span>
                  </div>

                  {/* Referral Code */}
                  {referralCode && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">Codice referral:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                          {referralCode}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyReferralCode}
                          className="w-6 h-6 rounded hover:bg-white/10"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Email:</span>
                    <span className="text-white font-medium text-sm">{profileData.email}</span>
                  </div>

                  {/* Mission Status */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">Stato Missione</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Indizi trovati:</span>
                        </div>
                        <span className="text-white font-medium">
                          {profileData.cluesFound}/{profileData.totalClues}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-gray-300">Giorni rimanenti:</span>
                        </div>
                        <span className="text-white font-medium">{profileData.daysRemaining}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-300">Inizio missione:</span>
                        </div>
                        <span className="text-white font-medium text-sm">
                          {formatDate(profileData.missionStartDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Section */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">Abbonamento</h4>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Piano attuale:</span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "font-semibold transition-all duration-300",
                              profileData.subscriptionTier === "Base" && "bg-gray-500 text-white",
                              profileData.subscriptionTier === "Silver" && "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900",
                              profileData.subscriptionTier === "Gold" && "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-md",
                              profileData.subscriptionTier === "Black" && "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg",
                              profileData.subscriptionTier === "Titanium" && "bg-gradient-to-r from-purple-500 to-cyan-500 text-white animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                            )}
                          >
                           {profileData.subscriptionTier?.toUpperCase() || 'BASE'}
                          </Badge>
                       </div>

                      <Button
                        onClick={handleUpgrade}
                        variant="outline"
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Disconnessione...' : 'Esci'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  Errore nel caricamento dei dati
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileToast;