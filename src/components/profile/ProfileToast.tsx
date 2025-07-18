// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Target, Clock, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReferralCode } from '@/hooks/useReferralCode';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

const ProfileToast: React.FC<ProfileToastProps> = ({ isOpen, onClose, className }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { referralCode, copyReferralCode } = useReferralCode();
  const { toast } = useToast();

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
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      // Fetch mission status
      const { data: missionStatus } = await supabase
        .from('user_mission_status')
        .select('clues_found, mission_started_at, mission_days_remaining')
        .eq('user_id', user.id)
        .single();

      setProfileData({
        username: profile?.username || profile?.full_name || 'Agente',
        email: user.email || '',
        cluesFound: missionStatus?.clues_found || 0,
        totalClues: 12, // Total clues in the mission
        daysRemaining: missionStatus?.mission_days_remaining || 30,
        missionStartDate: missionStatus?.mission_started_at || new Date().toISOString()
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