// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, ExternalLink, Trash2, Shield, Copyright, Settings, Award } from 'lucide-react';
import { CircularBackButton } from '@/components/ui/CircularBackButton';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

const LegalSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
  const { profileImage } = useProfileImage();
  const [loading, setLoading] = useState(false);

  const legalLinks: Array<{
    title: string;
    description: string;
    url: string;
    icon: any;
    action?: () => void;
  }> = [
    {
      title: 'Termini di Servizio',
      description: 'Condizioni d\'uso dell\'applicazione M1SSION™',
      url: '/terms',
      icon: FileText
    },
    {
      title: 'Privacy Policy',
      description: 'Come raccogliamo e utilizziamo i tuoi dati',
      url: '/privacy-policy',
      icon: Shield
    },
    {
      title: 'Cookie Policy',
      description: 'Come utilizziamo i cookie e tecnologie simili',
      url: '/cookie-policy',
      icon: Settings
    },
    {
      title: 'Gestisci preferenze cookie',
      description: 'Modifica le tue preferenze sulla privacy',
      url: '/settings/privacy',
      icon: Settings,
      action: () => {
        // In native app, window.__consent is not available (no web cookies)
        // Redirect to Privacy Settings instead
        if (window.__consent?.open) {
          window.__consent.open();
        } else {
          // Native app fallback - go to privacy settings
          window.location.href = '/settings/privacy';
        }
      }
    },
    {
      title: 'Regolamento M1SSION™',
      description: 'Modalità di gioco, premi, meccaniche e diritti',
      url: '/game-rules',
      icon: FileText
    },
    {
      title: 'Game Policies',
      description: 'Disclaimers, virtual currencies, anti-gambling policy',
      url: '/policies',
      icon: Shield
    },
    {
      title: 'SafeCreative',
      description: 'Certificazione di proprietà intellettuale',
      url: '/safecreative',
      icon: Copyright
    },
    {
      title: 'EUIPO – Marchio Registrato',
      description: 'Registrazione marchio EU n° 019289272',
      url: '/euipo',
      icon: Award
    }
  ];

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
      });

      if (error) throw error;
      if (data?.success !== true) {
        throw new Error(data?.error || 'Deletion failed');
      }

      await supabase.auth.signOut();
      localStorage.clear();

      toast({
        title: "✅ Account eliminato",
        description: "Il tuo account e tutti i dati associati sono stati eliminati permanentemente."
      });

      window.location.href = '/login';
    } catch (err: any) {
      console.error('Account deletion error:', err);
      const message = err?.message || err?.error || "Impossibile eliminare l'account. Riprova o contatta il supporto.";
      toast({
        title: "❌ Errore eliminazione account",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openExternalLink = (url: string) => {
    if (url.startsWith('/')) {
      // Navigate to internal pages
      window.location.href = url;
    } else if (url.startsWith('mailto:')) {
      // 🔧 FIX: mailto: links should open native mail client
      // Works on both iOS (Mail app) and Android (default mail client)
      window.location.href = url;
    } else if ((window as any).Capacitor) {
      // In Capacitor, open external URLs in system browser
      (window as any).Capacitor.Plugins.Browser?.open({ url });
    } else {
      // In web, open external URLs in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 🔧 P1 FIX 31/01/2026: REMOVED duplicate UnifiedHeader/BottomNavigation
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* UnifiedHeader REMOVED - provided by GlobalLayout */}
      
      {/* 🔧 FIX 28/01/2026: Layout come Info App */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header with Circular Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <CircularBackButton onClick={() => navigate('/settings')} size="md" />
            <div>
              <h1 className="text-xl font-orbitron text-white">Legale</h1>
              <p className="text-white/60 text-sm">Documenti legali e informazioni</p>
            </div>
          </div>

        {/* Legal Documents */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documenti Legali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {legalLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-[#00D1FF]" />
                    <div>
                      <h3 className="text-white font-medium">{link.title}</h3>
                      <p className="text-white/70 text-sm">{link.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => link.action ? link.action() : openExternalLink(link.url)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">Informazioni App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Versione</p>
                <p className="text-white font-medium">2.1.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Build</p>
                <p className="text-white font-medium">2025.12.05</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Sviluppatore</p>
                <p className="text-white font-medium">NIYVORA KFT™</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Copyright</p>
                <p className="text-white font-medium">M1SSION™ 2025</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#00D1FF]/10 rounded-lg border border-[#00D1FF]/20">
              <p className="text-[#00D1FF] text-sm font-medium">
                M1SSION™ è un'app ufficiale creata e sviluppata da NIYVORA KFT™.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-white/70 text-sm">
                Hai domande o hai bisogno di assistenza?
              </p>
              <Button
                onClick={() => openExternalLink('mailto:contact@m1ssion.com?subject=M1SSION%20Support%20Request')}
                variant="outline"
                className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
              >
                Contatta il Supporto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center text-red-400">
              <Trash2 className="w-5 h-5 mr-2" />
              Zona Pericolosa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-white/70 text-sm">
                ⚠️ L'eliminazione dell'account è permanente e irreversibile. 
                Tutti i tuoi dati, progressi, abbonamenti e acquisti verranno eliminati definitivamente.
              </p>
              
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                <h4 className="text-red-400 font-semibold mb-2">Verranno eliminati:</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  <li>• Profilo agente e statistiche</li>
                  <li>• Indizi completati e cronologia</li>
                  <li>• Metodi di pagamento e abbonamenti</li>
                  <li>• Tutte le preferenze e impostazioni</li>
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    Elimina Account Permanentemente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/90 border-red-500/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      ⚠️ Conferma Eliminazione Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      Questa azione è <strong>IRREVERSIBILE</strong>. Il tuo account M1SSION™ 
                      e tutti i dati associati verranno eliminati permanentemente.
                      <br /><br />
                      Non potrai recuperare progressi, abbonamenti o acquisti dopo la conferma.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/10 text-white border-white/20">
                      Annulla
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Elimina Definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>

      {/* BottomNavigation REMOVED - provided by GlobalLayout */}
    </div>
  );
};

export default LegalSettings;