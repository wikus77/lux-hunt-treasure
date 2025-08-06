// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Mail, Phone, Globe, Heart } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const AppInfoSettings: React.FC = () => {
  const { navigate } = useWouterNavigation();

  const appInfo = {
    version: '2.0.1',
    buildNumber: '2025.01.15',
    lastUpdate: '15 Gennaio 2025',
    platform: 'PWA iOS Safari',
    framework: 'React + Vite',
    backend: 'Supabase',
    pushNotifications: 'OneSignal'
  };

  const contactInfo = {
    supportEmail: 'support@m1ssion.eu',
    businessEmail: 'info@niyvora.com',
    phone: '+39 02 1234 5678',
    website: 'https://m1ssion.eu',
    company: 'NIYVORA KFT™'
  };

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:${contactInfo.supportEmail}?subject=M1SSION™ PWA - Supporto`;
  };

  const handleVisitWebsite = () => {
    window.open(contactInfo.website, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBackToSettings}
        className="text-white hover:bg-white/10 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Torna alle Impostazioni
      </Button>

      {/* App Information Card */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Info className="h-5 w-5 mr-2 text-[#00D1FF]" />
            Informazioni App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Versione</p>
              <p className="text-white font-medium">{appInfo.version}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Build</p>
              <p className="text-white font-medium">{appInfo.buildNumber}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Ultimo Aggiornamento</p>
              <p className="text-white font-medium">{appInfo.lastUpdate}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Piattaforma</p>
              <p className="text-white font-medium">{appInfo.platform}</p>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-2">
            <p className="text-white/60 text-sm">Tecnologie</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[#00D1FF]/20 text-[#00D1FF] text-xs rounded">
                {appInfo.framework}
              </span>
              <span className="px-2 py-1 bg-[#00D1FF]/20 text-[#00D1FF] text-xs rounded">
                {appInfo.backend}
              </span>
              <span className="px-2 py-1 bg-[#00D1FF]/20 text-[#00D1FF] text-xs rounded">
                {appInfo.pushNotifications}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support Card */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Mail className="h-5 w-5 mr-2 text-[#00D1FF]" />
            Supporto e Contatti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleContactSupport}
            variant="outline"
            className="w-full justify-start text-white border-white/20 hover:bg-white/10"
          >
            <Mail className="h-4 w-4 mr-2" />
            {contactInfo.supportEmail}
          </Button>
          
          <Button
            onClick={handleVisitWebsite}
            variant="outline"
            className="w-full justify-start text-white border-white/20 hover:bg-white/10"
          >
            <Globe className="h-4 w-4 mr-2" />
            {contactInfo.website}
          </Button>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-white/60" />
              <span className="text-white/80">{contactInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-white/60" />
              <span className="text-white/80">{contactInfo.company}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits Card */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Heart className="h-5 w-5 mr-2 text-[#F213A4]" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center space-y-2">
            <p className="text-white font-medium">M1SSION™</p>
            <p className="text-white/60 text-sm">
              È un'applicazione di 
              <button
                onClick={() => window.open('https://niyvora.com', '_blank')}
                className="text-[#00D1FF] hover:text-[#00A3CC] transition-colors underline ml-1"
              >
                NIYVORA KFT
              </button>
            </p>
            <div className="pt-2">
              <p className="text-[#F213A4] text-xs font-medium">
                LASCIA 2025 – All Rights Reserved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Stato Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Connessione</span>
              <span className="text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">PWA Installata</span>
              <span className="text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Attiva
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Notifiche Push</span>
              <span className="text-green-400 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Configurate
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AppInfoSettings;