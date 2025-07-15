// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
// M1SSION™ - Profile Page for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Target, 
  Trophy,
  Camera,
  Edit3,
  Shield,
  Star,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useEnhancedNavigation } from '@/hooks/useEnhancedNavigation';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';

interface ProfileData {
  id: string;
  email: string;
  full_name?: string;
  agent_code?: string;
  role: string;
  subscription_tier: string;
  credits: number;
  avatar_url?: string;
  agent_title?: string;
  investigative_style?: string;
}

interface UserStats {
  clues_unlocked: number;
  prizes_won: number;
  missions_completed: number;
  buzz_used: number;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { navigateWithFeedback, toHome } = useEnhancedNavigation();
  const { vibrate } = useCapacitorHardware();
  // TASK 1 — Sincronizzazione Piano Attivo da Supabase
  const { subscription } = useProfileSubscription();

  // Load user profile and stats
  const loadProfileData = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        toast.error('Errore nel caricamento del profilo');
        return;
      }

      setProfile(profileData);

      // Get user statistics
      const [cluesResult, buzzResult] = await Promise.all([
        supabase
          .from('user_clues')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('user_buzz_counter')
          .select('buzz_count')
          .eq('user_id', user.id)
      ]);

      const clues_unlocked = cluesResult.data?.length || 0;
      const buzz_used = buzzResult.data?.reduce((sum, day) => sum + day.buzz_count, 0) || 0;

      setStats({
        clues_unlocked,
        prizes_won: 0, // TODO: implement when prizes table is ready
        missions_completed: 0, // TODO: implement missions tracking
        buzz_used
      });

    } catch (err) {
      console.error('Error in loadProfileData:', err);
      toast.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, 'loadProfileData');

  useEffect(() => {
    loadProfileData();
    
    // 🧠 CONFERMA INTERATTIVA - Listen for subscription updates
    const handleStorageChange = () => {
      loadProfileData();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Handle navigation with haptic feedback - BY JOSEPH MULE
  const handleNavigation = preserveFunctionName(async (path: string) => {
    await vibrate(30);
    if (path === '/home') {
      await toHome();
    } else if (path.startsWith('/profile/')) {
      window.location.href = path;
    } else {
      window.location.href = path;
    }
  }, 'handleNavigation');

  // Handle logout
  const handleLogout = preserveFunctionName(async () => {
    try {
      await vibrate(50);
      await logout();
      await navigateWithFeedback('/login');
      toast.success('Logout effettuato con successo');
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Errore durante il logout');
    }
  }, 'handleLogout');

  // Get agent rank based on subscription tier
  const getAgentRank = (tier: string): { label: string; icon: any; color: string } => {
    switch (tier) {
      case 'Black':
      case 'premium':
        return { label: 'Agente Elite', icon: Crown, color: 'text-yellow-400' };
      case 'Gold':
      case 'gold':
        return { label: 'Agente Senior', icon: Star, color: 'text-yellow-500' };
      case 'Silver':
      case 'silver':
        return { label: 'Agente Operativo', icon: Shield, color: 'text-gray-400' };
      default:
        return { label: 'Agente Recluta', icon: User, color: 'text-blue-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Profilo non trovato</h2>
          <Button onClick={() => toHome()} variant="outline">
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  // 🧠 CONFERMA INTERATTIVA - Badge animato per piano attivo
  const agentRank = getAgentRank(subscription.plan);
  const AgentIcon = agentRank.icon;
  
  // Badge animato in ProfilePage.tsx (es: "Gold attivo ✅")
  const getActivePlanBadge = () => {
    if (subscription.plan === "Base") return null;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-2"
      >
        <Badge className={`${agentRank.color.replace('text-', 'bg-')} text-black`}>
          {subscription.plan} attivo ✅
        </Badge>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Avatar - BY JOSEPH MULE */}
              <div className="relative">
                <Avatar className="w-20 h-20 ring-2 ring-[#00D1FF]">
                  <AvatarImage 
                    src={profile.avatar_url || undefined} 
                    alt="Avatar utente"
                    onError={() => console.log('Avatar image failed to load')}
                  />
                  <AvatarFallback className="bg-[#3e3e3e] text-white text-xl">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-2 -right-2 bg-[#00D1FF] rounded-full p-2 hover:bg-[#00B8E6] transition-colors">
                  <Camera className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl font-bold text-white">
                    {profile.full_name || 'Agente Anonimo'}
                  </h1>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <AgentIcon className={`w-5 h-5 ${agentRank.color}`} />
                  <span className={`font-medium ${agentRank.color}`}>
                    {agentRank.label}
                  </span>
                  {getActivePlanBadge()}
                </div>

                {profile.agent_code && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {profile.agent_code}
                    </Badge>
                    <div className="flex items-center gap-1 text-[#00D1FF]">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">{profile.credits}</span>
                      <span className="text-sm text-gray-400">crediti</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.agent_title && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 text-sm italic">
                  "{profile.agent_title}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-[#00D1FF]" />
              <div className="text-2xl font-bold text-white">{stats.clues_unlocked}</div>
              <div className="text-sm text-gray-400">Indizi Sbloccati</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{stats.prizes_won}</div>
              <div className="text-sm text-gray-400">Premi Vinti</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-[#F059FF]" />
              <div className="text-2xl font-bold text-white">{stats.missions_completed}</div>
              <div className="text-sm text-gray-400">Missioni</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-[#F059FF] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.buzz_used}</div>
              <div className="text-sm text-gray-400">BUZZ Usati</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons - BY JOSEPH MULE */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Removed duplicate content that's already in /settings - 🔐 FIRMATO: BY JOSEPH MULE — Capacitor iOS Compatible */}

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleNavigation('/subscriptions')}
        >
          <Crown className="w-5 h-5 mr-3" />
          Aggiorna Abbonamento
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="w-5 h-5 mr-3" />
          Impostazioni
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </motion.div>

      {/* Agent Style */}
      {profile.investigative_style && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-white">Stile Investigativo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{profile.investigative_style}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;