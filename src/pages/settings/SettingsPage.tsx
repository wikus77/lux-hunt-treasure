import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Shield, Target, Bell, Lock, 
  FileText, Info, MapPin, Stethoscope, HelpCircle,
  ChevronRight
} from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SUPABASE_CONFIG } from '@/lib/supabase/config';

type SettingsSection = 
  | 'agent-profile' 
  | 'security'
  | 'mission'
  | 'notifications'
  | 'privacy'
  | 'legal'
  | 'app-info'
  | 'privacy-permissions'
  | 'diagnostics'
  | 'support';

const SettingsPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('Verifica...');
  const geo = useGeolocation();
  
  const supabaseProjectId = SUPABASE_CONFIG.projectRef;

  useEffect(() => {
    checkGeolocation();
    checkSession();
  }, []);

  const checkGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGeolocationEnabled(true),
        () => setGeolocationEnabled(false)
      );
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionStatus(session ? 'Attiva' : 'Non attiva');
    } catch (error) {
      setSessionStatus('Errore');
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setLocation(`/settings/${sectionId}`);
  };

  const sections = [
    {
      id: 'agent-profile',
      label: 'Profilo Agente',
      description: 'Avatar, nome e informazioni agente',
      icon: User,
    },
    {
      id: 'security',
      label: 'Sicurezza',
      description: 'Password e codici di emergenza',
      icon: Shield,
    },
    {
      id: 'mission',
      label: 'Missione',
      description: 'Stato missioni e progressi',
      icon: Target,
    },
    {
      id: 'notifications',
      label: 'Notifiche',
      description: 'Preferenze e alert',
      icon: Bell,
    },
    {
      id: 'privacy',
      label: 'Privacy',
      description: 'Gestione consensi e cookie',
      icon: Lock,
    },
    {
      id: 'legal',
      label: 'Legale',
      description: 'Termini, privacy e account',
      icon: FileText,
    },
    {
      id: 'app-info',
      label: 'Info App',
      description: 'Versione, supporto e credits',
      icon: Info,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <UnifiedHeader />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Impostazioni
            </h1>
            <p className="text-muted-foreground text-lg">Configura la tua esperienza M1SSION</p>
          </div>

          {/* Settings Cards */}
          <div className="space-y-3">
            {sections.map((section) => (
              <Card 
                key={section.id} 
                className="glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-0 bg-card/50 backdrop-blur-md"
                onClick={() => handleSectionChange(section.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <section.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{section.label}</h3>
                        <p className="text-sm text-muted-foreground/80">{section.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Privacy & Permissions Section */}
          <div className="space-y-4 mt-8">
            <Card className="glass-card border-0 bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Privacy & Permessi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="glass-card p-4 border-0 bg-background/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-medium text-foreground">Geolocalizzazione</span>
                    </div>
                    <Badge 
                      variant={geolocationEnabled ? "default" : "secondary"}
                      className={geolocationEnabled ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                    >
                      {geolocationEnabled ? "Attiva" : "Disattiva"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground/80 mb-3">
                    Permetti l'accesso alla posizione per le funzionalità di missione
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkGeolocation}
                    className="w-full bg-background/50 border-primary/30 hover:bg-primary/10"
                  >
                    Verifica Permessi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Diagnostics Section */}
          <div className="space-y-4">
            <Card className="glass-card border-0 bg-card/40 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Diagnostica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="glass-card p-4 border-0 bg-background/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Stethoscope className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="font-medium text-foreground">Info Supabase</span>
                    </div>
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      ID: {supabaseProjectId.slice(0, 8)}...
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground/80">Stato Sessione:</span>
                      <Badge 
                        variant={sessionStatus === 'Attiva' ? "default" : "destructive"}
                        className={sessionStatus === 'Attiva' ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                      >
                        {sessionStatus}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkSession}
                      className="w-full bg-background/50 border-green-500/30 hover:bg-green-500/10"
                    >
                      Verifica Sessione
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;