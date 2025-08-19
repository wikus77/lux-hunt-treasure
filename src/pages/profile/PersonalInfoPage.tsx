// ✅ Update By JOSEPH MULE – 12/07/2025 – Header fix + Avatar upload fix
import React, { useState, useRef } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfileData } from '@/hooks/useProfileData';

const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, actions } = useProfileData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: profileData.name || '',
    username: profileData.agentCode || '',
    email: profileData.personalInfo?.email || '',
    phone: profileData.personalInfo?.phone || '',
    location: profileData.personalInfo?.city || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // TASK 3 — Gestione Avatar (Upload Immagine Profilo)
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Seleziona solo file immagine (PNG, JPG, JPEG).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for iOS compatibility
      toast({
        title: "Errore", 
        description: "Il file è troppo grande. Massimo 2MB consentiti per iOS.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique folder for user avatars
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;
      
      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      actions.setProfileImage(publicUrl);
      
      toast({
        title: "Avatar aggiornato",
        description: "Il tuo avatar è stato caricato con successo.",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Errore",
        description: `Impossibile caricare l'avatar: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // TASK 2 — Salvataggio Info Personali (Fix Form)
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          agent_code: formData.username,
          phone: formData.phone,
          city: formData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      actions.setName(formData.fullName);
      actions.setAgentCode(formData.username);
      
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: "rgba(19, 21, 33, 0.55)",
          backdropFilter: "blur(12px)"
        }}
      >
        <UnifiedHeader leftComponent={<M1ssionText />} />
      </header>
      
      <motion.main 
        className="text-white"
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card mx-2 sm:mx-4 mt-4 mb-4">
          <div className="p-3 sm:p-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Informazioni Personali</h1>
            </div>
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white/60" />
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                  disabled={isLoading}
                >
                  <Upload className="h-3 w-3" />
                </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    capture="environment"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
              </div>
              <p className="text-sm text-white/60 mt-2">Clicca per cambiare avatar</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Inserisci il tuo nome completo"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Username unico"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  readOnly
                  className="bg-white/5 border-white/20 text-white/60 cursor-not-allowed"
                />
                <p className="text-xs text-white/40">L'email non può essere modificata</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefono
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+39 123 456 7890"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Località
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Città, Paese"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default PersonalInfoPage;