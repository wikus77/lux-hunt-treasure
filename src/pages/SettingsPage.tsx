// Pagina delle impostazioni utente
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Bell, Shield, Globe, Smartphone, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    buzz: boolean;
    games: boolean;
  };
  privacy: {
    location: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  app: {
    language: string;
    theme: string;
    sound: boolean;
    vibration: boolean;
    autoLogin: boolean;
  };
  profile: {
    displayName: string;
    agentCode: string;
    avatar: string;
  };
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { vibrate, playSound } = useCapacitorHardware();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      push: true,
      email: true,
      buzz: true,
      games: false
    },
    privacy: {
      location: true,
      analytics: false,
      crashReports: true
    },
    app: {
      language: 'it',
      theme: 'dark',
      sound: true,
      vibration: true,
      autoLogin: false
    },
    profile: {
      displayName: user?.user_metadata?.full_name || '',
      agentCode: user?.user_metadata?.agent_code || '',
      avatar: user?.user_metadata?.avatar_url || ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carica impostazioni dal localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('m1ssion_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Errore nel caricamento impostazioni:', error);
      }
    }
  }, []);

  // Salva impostazioni
  const saveSettings = async (newSettings: UserSettings) => {
    setIsLoading(true);
    try {
      localStorage.setItem('m1ssion_settings', JSON.stringify(newSettings));
      
      // Aggiorna profilo utente se necessario
      if (newSettings.profile.displayName !== settings.profile.displayName) {
        await updateProfile({
          full_name: newSettings.profile.displayName
        });
      }

      setSettings(newSettings);
      
      if (settings.app.sound) {
        playSound('chime');
      }
      if (settings.app.vibration) {
        vibrate(100);
      }

      toast({
        title: 'Impostazioni Salvate',
        description: 'Le tue preferenze sono state aggiornate.'
      });
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le impostazioni.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile effettuare il logout.'
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <SafeAreaWrapper className="min-h-screen bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="glass-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-orbitron font-bold text-foreground">
            Impostazioni
          </h1>
        </motion.div>

        {/* Profilo Utente */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profilo Agente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={settings.profile.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary font-orbitron">
                    {settings.profile.displayName?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="displayName">Nome Agente</Label>
                    <Input
                      id="displayName"
                      value={settings.profile.displayName}
                      onChange={(e) => handleSettingChange('profile', 'displayName', e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {settings.profile.agentCode || 'AG-XXXXX'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Codice Agente</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifiche */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifiche Push</Label>
                  <p className="text-sm text-muted-foreground">Ricevi notifiche in tempo reale</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifiche BUZZ</Label>
                  <p className="text-sm text-muted-foreground">Avvisi per nuove aree disponibili</p>
                </div>
                <Switch
                  checked={settings.notifications.buzz}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'buzz', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifiche Giochi</Label>
                  <p className="text-sm text-muted-foreground">Sfide e nuovi mini-giochi</p>
                </div>
                <Switch
                  checked={settings.notifications.games}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'games', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy e Sicurezza */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy e Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Condivisione Posizione</Label>
                  <p className="text-sm text-muted-foreground">Permetti accesso alla geolocalizzazione</p>
                </div>
                <Switch
                  checked={settings.privacy.location}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'location', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dati Analitici</Label>
                  <p className="text-sm text-muted-foreground">Condividi dati per migliorare l'app</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'analytics', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Report Crash</Label>
                  <p className="text-sm text-muted-foreground">Invia automaticamente report errori</p>
                </div>
                <Switch
                  checked={settings.privacy.crashReports}
                  onCheckedChange={(checked) => handleSettingChange('privacy', 'crashReports', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applicazione */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Applicazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lingua</Label>
                <Select
                  value={settings.app.language}
                  onValueChange={(value) => handleSettingChange('app', 'language', value)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Effetti Sonori</Label>
                  <p className="text-sm text-muted-foreground">Audio per interazioni e notifiche</p>
                </div>
                <Switch
                  checked={settings.app.sound}
                  onCheckedChange={(checked) => handleSettingChange('app', 'sound', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vibrazione</Label>
                  <p className="text-sm text-muted-foreground">Feedback aptico per le azioni</p>
                </div>
                <Switch
                  checked={settings.app.vibration}
                  onCheckedChange={(checked) => handleSettingChange('app', 'vibration', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Azioni */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Button
            variant="outline"
            className="w-full glass-card border-destructive/20 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Disconnetti
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            M1SSION™ v1.0.0 - Build 2024.1
          </div>
        </motion.div>
      </motion.div>
    </SafeAreaWrapper>
  );
};

export default SettingsPage;