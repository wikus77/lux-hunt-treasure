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
import { FileText, ExternalLink, Trash2, Shield, Copyright, Settings } from 'lucide-react';
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
      description: 'Modifica le tue preferenze sui cookie',
      url: '#consent',
      icon: Settings,
      action: () => window.__consent?.open()
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
    }
  ];

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete from specific tables that reference user_id
      await supabase.from('user_clues').delete().eq('user_id', user.id);
      await supabase.from('user_buzz_counter').delete().eq('user_id', user.id);
      await supabase.from('user_notifications').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);

      // Delete profile (this should cascade to other references)
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out user
      await supabase.auth.signOut();

      // Clear local storage
      localStorage.clear();

      toast({
        title: "✅ Account eliminato",
        description: "Il tuo account e tutti i dati associati sono stati eliminati permanentemente."
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "❌ Errore eliminazione account",
        description: error.message || "Impossibile eliminare l'account. Contatta il supporto.",
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
    } else if ((window as any).Capacitor) {
      // In Capacitor, open external URLs in system browser
      (window as any).Capacitor.Plugins.Browser?.open({ url });
    } else {
      // In web, open external URLs in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-white font-orbitron">Legale</h1>
          <p className="text-white/70">Documenti legali e informazioni</p>
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
                <p className="text-white font-medium">1.0.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Build</p>
                <p className="text-white font-medium">2025.01.12</p>
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
                onClick={() => openExternalLink('mailto:support@m1ssion.app')}
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
      </motion.div>

      {/* Bottom Navigation */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

export default LegalSettings;