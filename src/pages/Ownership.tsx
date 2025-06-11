
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';

const Ownership = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();

  const handleEmailClick = () => {
    // Navigate to notifications or handle email click
  };

  return (
    <div className="min-h-screen bg-black" id="ownership">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="pb-24 px-4 pt-2 max-w-screen-xl mx-auto">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+64px)]">
          <h1 className="text-xl font-semibold text-white mb-2">Ownership e autenticità digitale</h1>
          <p className="text-white/70 mb-6">
            Tutti i diritti relativi al progetto M1SSION™ sono legalmente registrati, verificabili e tutelati a livello europeo.
          </p>
          
          <button
            onClick={() => navigate(-1)}
            className="w-6 h-6 text-white relative z-50 mb-6"
            aria-label="Torna alla pagina precedente"
          >
            <ArrowLeft />
          </button>
        </div>

        <div className="glass-card p-6 space-y-8">
          
          {/* Sezione 1 - Titolare ufficiale */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center">
              🔐 Titolare ufficiale del progetto
            </h2>
            <div className="space-y-3 text-white/80">
              <p><strong className="text-white">Nome legale della società:</strong> M1SSION KFT</p>
              <p><strong className="text-white">Sede legale:</strong> 1077 Budapest, Izabella utca 2 alagsor 1</p>
              <p><strong className="text-white">Partita IVA ungherese:</strong> HU01234567</p>
              <p><strong className="text-white">Direttore e unico socio:</strong> Joseph Mule</p>
            </div>
          </div>

          {/* Sezione 2 - Registrazione marchio */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center">
              🛡️ Registrazione marchio e proprietà intellettuale
            </h2>
            <div className="space-y-3 text-white/80">
              <p><strong className="text-white">Marchio denominativo "M1SSION":</strong> registrato presso EUIPO (European Union Intellectual Property Office)</p>
              <p><strong className="text-white">Marchio figurativo:</strong> incluso logo ufficiale</p>
              <p><strong className="text-white">Slogan protetto:</strong> IT IS POSSIBLE</p>
              <p><strong className="text-white">Diritti d'autore coperti:</strong> applicazione, sito, meccaniche di gioco, grafica, ambientazione narrativa, codice software</p>
              
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <p className="text-sm text-white/70 mb-2">📎 Link alla registrazione EUIPO:</p>
                <a 
                  href="https://euipo.europa.eu/eSearch/#details/trademarks/M1SSION" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-projectx-neon-blue underline hover:text-projectx-neon-blue/80 transition-colors"
                >
                  https://euipo.europa.eu/eSearch/#details/trademarks/M1SSION
                </a>
              </div>
            </div>
          </div>

          {/* Sezione 3 - Blockchain */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center">
              🔗 Prova di autenticità su Blockchain
            </h2>
            <p className="text-white/80 mb-4">
              Per garantire la non alterabilità del progetto, la sua prima versione è stata notarizzata in blockchain.
            </p>
            <div className="space-y-3 text-white/80">
              <p><strong className="text-white">Blockchain usata:</strong> Ethereum mainnet</p>
              <p><strong className="text-white">Smart Contract/Hash:</strong> <code className="bg-black/30 px-2 py-1 rounded text-sm">0x94bcf7e1d3c423f0f8f3cd1b90ae98a9c2d47012</code></p>
              <p><strong className="text-white">Data notarizzazione:</strong> 2025-05-28</p>
              <div>
                <p><strong className="text-white">Contenuto notarizzato:</strong></p>
                <p className="ml-4 text-sm">Descrizione ufficiale del progetto M1SSION™, elementi grafici e logici, codice iniziale, file PDF con piano originale.</p>
              </div>
              
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <p className="text-sm text-white/70 mb-2">📎 Verifica pubblica (via Etherscan):</p>
                <a 
                  href="https://etherscan.io/tx/0x94bcf7e1d3c423f0f8f3cd1b90ae98a9c2d47012" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-projectx-neon-blue underline hover:text-projectx-neon-blue/80 transition-colors break-all"
                >
                  https://etherscan.io/tx/0x94bcf7e1d3c423f0f8f3cd1b90ae98a9c2d47012
                </a>
              </div>
            </div>
          </div>

          {/* Sezione 4 - Tutela internazionale */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center">
              🧾 Tutela internazionale
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                Ogni uso non autorizzato del nome, del logo, dei contenuti o dell'interfaccia dell'app M1SSION™ sarà perseguito legalmente.
              </p>
              <div className="p-3 bg-black/30 rounded-lg">
                <p className="text-white font-medium mb-2">Per collaborazioni, licenze o verifiche ufficiali:</p>
                <p className="text-sm">
                  📩 Scrivi a: <a href="mailto:contact@m1ssion.com" className="text-projectx-neon-blue underline hover:text-projectx-neon-blue/80 transition-colors">contact@m1ssion.com</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Ownership;
