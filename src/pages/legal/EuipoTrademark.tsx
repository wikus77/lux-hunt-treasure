// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ExternalLink, Shield, Globe, CheckCircle } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { CircularBackButton } from '@/components/ui/CircularBackButton';

const EuipoTrademark: React.FC = () => {
  const { navigate } = useWouterNavigation();

  // EUIPO Registration Data - Classes 9, 28, 41, 42
  const euipoClasses = [
    {
      number: 9,
      title: 'Classe 9 – Software & App',
      titleEn: 'Class 9 – Software & Apps',
      items: [
        'Software applicativo mobile scaricabile',
        'Software per intrattenimento interattivo',
        'Software per giochi a premi e concorsi',
        'Applicazioni per smartphone e tablet',
        'Software per geolocalizzazione e mappe interattive',
        'Software per realtà aumentata (AR)',
        'Piattaforme digitali per contenuti multimediali'
      ],
      itemsEn: [
        'Downloadable mobile application software',
        'Interactive entertainment software',
        'Software for prize games and contests',
        'Applications for smartphones and tablets',
        'Software for geolocation and interactive maps',
        'Augmented reality (AR) software',
        'Digital platforms for multimedia content'
      ]
    },
    {
      number: 28,
      title: 'Classe 28 – Giochi & Intrattenimento',
      titleEn: 'Class 28 – Games & Entertainment',
      items: [
        'Giochi elettronici diversi da quelli concepiti per essere usati solo con televisori',
        'Giochi di società',
        'Giochi interattivi',
        'Giocattoli elettronici',
        'Giochi a premi (non d\'azzardo)',
        'Apparecchi per giochi'
      ],
      itemsEn: [
        'Electronic games other than those designed to be used only with televisions',
        'Board games',
        'Interactive games',
        'Electronic toys',
        'Prize games (non-gambling)',
        'Game apparatus'
      ]
    },
    {
      number: 41,
      title: 'Classe 41 – Servizi di Intrattenimento',
      titleEn: 'Class 41 – Entertainment Services',
      items: [
        'Servizi di intrattenimento interattivo',
        'Organizzazione e conduzione di concorsi',
        'Servizi di giochi online',
        'Produzione di contenuti multimediali',
        'Servizi di intrattenimento, vale a dire fornire giochi interattivi',
        'Organizzazione di eventi a tema',
        'Servizi educativi e di formazione'
      ],
      itemsEn: [
        'Interactive entertainment services',
        'Organization and conducting of contests',
        'Online gaming services',
        'Production of multimedia content',
        'Entertainment services, namely providing interactive games',
        'Organization of themed events',
        'Educational and training services'
      ]
    },
    {
      number: 42,
      title: 'Classe 42 – Servizi Tecnologici',
      titleEn: 'Class 42 – Technology Services',
      items: [
        'Progettazione e sviluppo di software',
        'Software come servizio (SaaS)',
        'Piattaforme tecnologiche come servizio (PaaS)',
        'Hosting di piattaforme su Internet',
        'Servizi di cloud computing',
        'Sviluppo di applicazioni mobile',
        'Servizi di consulenza tecnologica'
      ],
      itemsEn: [
        'Software design and development',
        'Software as a service (SaaS)',
        'Platform as a service (PaaS)',
        'Hosting platforms on the Internet',
        'Cloud computing services',
        'Mobile application development',
        'Technology consulting services'
      ]
    }
  ];

  const openEuipoSearch = () => {
    const url = 'https://euipo.europa.eu/eSearch/#details/trademarks/019289272';
    if ((window as any).Capacitor?.Plugins?.Browser) {
      (window as any).Capacitor.Plugins.Browser.open({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 🔧 P1 FIX 31/01/2026: REMOVED duplicate UnifiedHeader/BottomNavigation
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* UnifiedHeader REMOVED - provided by GlobalLayout */}
      
      {/* Layout come Info App */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header with Circular Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <CircularBackButton onClick={() => navigate('/settings/legal')} size="md" />
            <div>
              <h1 className="text-xl font-orbitron text-white">EUIPO Trademark</h1>
              <p className="text-white/60 text-sm">Marchio Registrato EU</p>
            </div>
          </div>

          {/* Registration Info Card */}
          <Card className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border-amber-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Award className="w-6 h-6 mr-2 text-amber-400" />
                M1SSION™ – Marchio Registrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-white/70 text-sm">N° Registrazione</p>
                  <p className="text-amber-400 font-mono font-bold">019289272</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/70 text-sm">Ente</p>
                  <p className="text-white font-medium">EUIPO</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/70 text-sm">Territorio</p>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <p className="text-white font-medium">Unione Europea</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white/70 text-sm">Status</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 font-medium">Registrato</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={openEuipoSearch}
                variant="outline"
                className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 mt-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Verifica su EUIPO
              </Button>
            </CardContent>
          </Card>

          {/* Classes Cards - Italian */}
          <div className="space-y-4">
            <h2 className="text-lg font-orbitron text-white flex items-center">
              🇮🇹 Classi di Registrazione
            </h2>
            
            {euipoClasses.map((classItem) => (
              <Card key={classItem.number} className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#00D1FF] font-orbitron text-base">
                    {classItem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {classItem.items.map((item, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start">
                        <span className="text-[#00D1FF] mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Classes Cards - English */}
          <div className="space-y-4 mt-8">
            <h2 className="text-lg font-orbitron text-white flex items-center">
              🇬🇧 Registration Classes
            </h2>
            
            {euipoClasses.map((classItem) => (
              <Card key={`en-${classItem.number}`} className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400 font-orbitron text-base">
                    {classItem.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {classItem.itemsEn.map((item, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legal Notice */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Il marchio M1SSION™ è protetto dall'Ufficio dell'Unione Europea per la Proprietà 
                    Intellettuale (EUIPO). Qualsiasi uso non autorizzato è vietato e può comportare 
                    azioni legali.
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    © 2025 NIYVORA KFT™ – Tutti i diritti riservati
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* BottomNavigation REMOVED - provided by GlobalLayout */}
    </div>
  );
};

export default EuipoTrademark;
