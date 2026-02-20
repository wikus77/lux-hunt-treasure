import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Shield, Target, Bell, Lock, 
  FileText, Info, HelpCircle,
  ChevronRight, CreditCard, Trash2
} from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getProjectRef } from '@/lib/supabase/clientUtils';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

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
  | 'support'
  | 'payment-methods';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('Verifica...');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const geo = useGeolocation();
  
  const supabaseProjectId = getProjectRef();

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      t('delete_account_confirm') || 'Sei sicuro? Questa azione è irreversibile. Tutti i dati verranno eliminati.'
    );
    if (!confirmed) return;
    setDeleteAccountLoading(true);
    try {
      await supabase.from('user_clues').delete().eq('user_id', user.id);
      await supabase.from('user_buzz_counter').delete().eq('user_id', user.id);
      await supabase.from('user_notifications').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
      localStorage.clear();
      toast({ title: '✅ ' + (t('account_deleted') || 'Account eliminato') });
      window.location.href = '/login';
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({ title: '❌ ' + (t('error') || 'Errore'), description: msg, variant: 'destructive' });
    } finally {
      setDeleteAccountLoading(false);
    }
  };

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
      id: 'payment-methods',
      label: t('section_payment_methods') || 'Metodi di Pagamento',
      description: t('section_payment_methods_desc'),
      icon: CreditCard,
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

  // 🔧 P1 FIX 31/01/2026: REMOVED duplicate UnifiedHeader/BottomNavigation
  // These are already provided by GlobalLayout in WouterRoutes.tsx
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* UnifiedHeader REMOVED - provided by GlobalLayout */}
      
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

          {/* Elimina Account Permanentemente — visible in Settings root (Apple requirement) */}
          <div className="space-y-4 mt-8">
            <Card className="glass-card border-0 bg-card/40 backdrop-blur-md border-red-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  {t('delete_account_permanently') || 'Elimina Account Permanentemente'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground/80 mb-4">
                  {t('delete_account_warning') || 'Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati.'}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountLoading}
                  className="w-full"
                >
                  {deleteAccountLoading ? (t('loading') || '...') : (t('delete_account_permanently') || 'Elimina Account Permanentemente')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* BottomNavigation REMOVED - provided by GlobalLayout */}
    </div>
  );
};

export default SettingsPage;