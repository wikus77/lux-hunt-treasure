// ✅ BY JOSEPH MULÈ — CEO di NIYVORA KFT
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileData } from '@/hooks/useProfileData';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';
import { useGlobalProfileSync } from '@/hooks/useGlobalProfileSync';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Copy, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AgentProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { profileData, actions } = useProfileData();
  const { updateProfile } = useProfileRealtime();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const globalProfile = useGlobalProfileSync();
  const [agentName, setAgentName] = useState(profileData.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync agentName with global profile updates and custom events
  useEffect(() => {
    if (globalProfile?.full_name) {
      setAgentName(globalProfile.full_name);
    }
  }, [globalProfile?.full_name]);

  // Listen for global profile sync events
  useEffect(() => {
    const handleProfileSync = (event: CustomEvent) => {
      console.log('🔄 AgentProfileSettings received sync event:', event.detail);
      if (event.detail?.full_name) {
        setAgentName(event.detail.full_name);
      }
    };

    window.addEventListener('profile-sync', handleProfileSync as EventListener);
    return () => {
      window.removeEventListener('profile-sync', handleProfileSync as EventListener);
    };
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size for iOS compatibility
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato non supportato",
        description: "Carica solo immagini JPG o PNG.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for iOS compatibility
      toast({
        title: "File troppo grande",
        description: "L'immagine deve essere inferiore a 2MB.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use correct file path format for Supabase storage
      const fileName = `avatar.jpg`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Use realtime update for immediate sync
      await updateProfile({
        avatar_url: publicUrl
      });

      // Update profileData immediately for visual feedback
      actions.setProfileImage(publicUrl);

      toast({
        title: "✅ Avatar aggiornato",
        description: "La tua immagine profilo è stata salvata con successo."
      });

    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "❌ Errore upload",
        description: `Impossibile aggiornare l'avatar: ${error.message || 'Errore sconosciuto'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !agentName.trim()) return;
    
    setLoading(true);
    try {
      console.log('🔄 M1SSION™ Saving agent name:', agentName);
      
      // Use realtime update for immediate sync
      const result = await updateProfile({
        full_name: agentName.trim()
      });

      // Check if there was an error (updateProfile returns void on success)
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw result.error;
      }

      // Update local profile data for consistency
      actions.setName(agentName.trim());
      
      // Force localStorage update for immediate UI sync
      localStorage.setItem('agentName', agentName.trim());
      localStorage.setItem('profileName', agentName.trim());
      
      // Trigger global sync event for real-time updates
      const syncEvent = new CustomEvent('profile-sync', {
        detail: { full_name: agentName.trim() }
      });
      window.dispatchEvent(syncEvent);
      
      // Also trigger storage event for components listening to localStorage
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "✅ Profilo salvato",
        description: "Il nome agente è stato aggiornato con successo."
      });
      
      console.log('✅ M1SSION™ Agent name saved successfully');
    } catch (error) {
      console.error('❌ M1SSION™ Profile save error:', error);
      toast({
        title: "❌ Errore salvataggio",
        description: `Impossibile salvare le modifiche: ${error?.message || 'Errore sconosciuto'}`,
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
        description: "User ID copiato negli appunti."
      });
    }
  };

  const getTierBadge = () => {
    const tier = profileData.subscription?.plan || 'Base';
    const tierColors = {
      'Base': 'bg-gray-600',
      'Silver': 'bg-gray-400',
      'Gold': 'bg-yellow-500',
      'Black': 'bg-black border border-white'
    };
    
    return (
      <Badge className={`${tierColors[tier as keyof typeof tierColors]} text-white`}>
        {tier === 'Base' ? 'Starter' : tier === 'Silver' ? 'Elite' : tier === 'Gold' ? 'Elite+' : 'M1SSION+'}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Profilo Agente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={profileData.profileImage || '/placeholder.svg'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-[#00D1FF]/30 object-cover"
              />
              <Button
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute -bottom-2 -right-2 rounded-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-white">Nome Agente</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Inserisci il tuo nome agente"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input
              value={user?.email || ''}
              readOnly
              className="bg-black/20 border-white/20 text-white/70 cursor-not-allowed"
            />
          </div>

          {/* User ID (readonly with copy) */}
          <div className="space-y-2">
            <Label className="text-white">User ID</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={user?.id ? `${user.id.substring(0, 8)}...` : ''}
                readOnly
                className="bg-black/20 border-white/20 text-white/70 cursor-not-allowed flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyUserId}
                className="border-white/20 hover:bg-white/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tier Badge */}
          <div className="space-y-2">
            <Label className="text-white">Tier Attivo</Label>
            <div className="flex items-center">
              {getTierBadge()}
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
  );
};

export default AgentProfileSettings;