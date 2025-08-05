// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';
import { useGlobalProfileSync } from '@/hooks/useGlobalProfileSync';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useToast } from '@/hooks/use-toast';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Upload, User, Mail, IdCard, ArrowLeft } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

const AgentProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData } = useProfileData();
  const { navigate } = useWouterNavigation();
  const { profileImage } = useProfileImage();
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(false);

  // Use global profile data with real-time updates
  useProfileRealtime();
  const { globalProfile } = useGlobalProfileSync();

  // Sync agent name with profile updates
  useEffect(() => {
    if (profileData?.name) {
      setAgentName(profileData.name);
    }
  }, [profileData]);

  // Listen for custom profile sync events
  useEffect(() => {
    const handleProfileSync = (event: CustomEvent) => {
      const { agentName: syncedAgentName } = event.detail;
      if (syncedAgentName) {
        setAgentName(syncedAgentName);
      }
    };

    window.addEventListener('profile-sync', handleProfileSync as EventListener);
    return () => window.removeEventListener('profile-sync', handleProfileSync as EventListener);
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Per favore seleziona un file immagine valido.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "L'immagine deve essere più piccola di 5MB.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Avatar aggiornato",
        description: "La tua immagine profilo è stata aggiornata con successo."
      });

    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "❌ Errore upload",
        description: error.message || "Impossibile caricare l'immagine. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate agent name
    if (!agentName.trim()) {
      toast({
        title: "❌ Nome obbligatorio",
        description: "Inserisci un nome agente per salvare.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          agent_name: agentName.trim()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Trigger real-time update
      const event = new CustomEvent('profile-update', {
        detail: { agentName: agentName.trim() }
      });
      window.dispatchEvent(event);

      // Update localStorage for immediate feedback
      const localProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      localProfile.agent_name = agentName.trim();
      localStorage.setItem('userProfile', JSON.stringify(localProfile));

      // Dispatch global sync event
      const syncEvent = new CustomEvent('profile-sync', {
        detail: { agentName: agentName.trim() }
      });
      window.dispatchEvent(syncEvent);

      toast({
        title: "✅ Profilo aggiornato",
        description: "I tuoi dati sono stati salvati con successo."
      });
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: "❌ Errore salvataggio",
        description: error.message || "Impossibile salvare il profilo. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({
        title: "✅ ID copiato",
        description: "L'ID utente è stato copiato negli appunti."
      });
    }
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      'starter': { 
        bg: 'bg-gray-500/20 border-gray-500/30', 
        text: 'text-gray-300',
        label: 'Starter'
      },
      'premium': { 
        bg: 'bg-yellow-500/20 border-yellow-500/30', 
        text: 'text-yellow-300',
        label: 'Premium'
      },
      'enterprise': { 
        bg: 'bg-purple-500/20 border-purple-500/30', 
        text: 'text-purple-300',
        label: 'Enterprise'
      }
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.starter;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <div 
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="text-white/70 hover:text-white hover:bg-white/5 p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Indietro
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#00D1FF] font-orbitron">Profilo Agente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-2 border-[#00D1FF]/30">
                  <AvatarImage 
                    src={profileImage || globalProfile?.avatar_url || user?.user_metadata?.avatar_url} 
                    alt="Avatar agente" 
                  />
                  <AvatarFallback className="bg-[#00D1FF]/20 text-[#00D1FF] text-xl font-bold">
                    {agentName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center space-y-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Cambia Avatar
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Agent Name */}
              <div className="space-y-2">
                <Label htmlFor="agentName" className="text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nome Agente
                </Label>
                <Input
                  id="agentName"
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-black/20 border-white/20 text-white"
                  placeholder="Inserisci il tuo nome agente"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="text-white flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="bg-black/10 border-white/10 text-white/70 cursor-not-allowed"
                />
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label className="text-white flex items-center">
                  <IdCard className="w-4 h-4 mr-2" />
                  User ID
                </Label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={user?.id || ''}
                    readOnly
                    className="bg-black/10 border-white/10 text-white/70 cursor-not-allowed flex-1"
                  />
                  <Button
                    onClick={copyUserId}
                    variant="outline"
                    size="icon"
                    className="border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Active Tier */}
              <div className="space-y-2">
                <Label className="text-white">Tier Attivo</Label>
                <div className="flex items-center">
                  {getTierBadge(profileData?.tier || 'starter')}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
              >
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div 
        id="settings-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

export default AgentProfileSettings;