
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';

const HelpFaq = () => {
  const { profileImage } = useProfileImage();

  const handleEmailClick = () => {
    // Navigate to notifications or handle email click
  };

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="pb-24 px-4 pt-2 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            asChild
          >
            <Link to="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold mb-4 text-white">❓ Aiuto & FAQ</h1>
          <p className="text-white/80 mb-6">
            Benvenuto nella sezione di supporto ufficiale di <strong>M1SSION™</strong>. Qui trovi risposte rapide alle domande più frequenti, guide essenziali e contatti utili per ricevere assistenza immediata. Se non trovi quello che cerchi, puoi sempre <a href="#segnala" className="text-projectx-neon-blue underline font-semibold">segnalare un problema</a>.
          </p>

          {/* Inizio sezione FAQ */}
          <div className="mt-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white mb-2">📌 COS'È M1SSION?</h2>
              <p className="text-white/70">M1SSION è un'esperienza interattiva a premi basata su missioni, indizi e sfide urbane. I giocatori competono per vincere premi reali completando missioni distribuite nel tempo e nello spazio.</p>
            </div>
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white mb-2">🎮 COME FUNZIONANO LE MISSIONI?</h2>
              <p className="text-white/70">Le missioni sono sfide logiche o geolocalizzate. Puoi ricevere indizi settimanali o usare il tasto BUZZ MAPPA per ottenerne altri. I premi variano da tech a supercar.</p>
            </div>
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white mb-2">🛠️ NON RIESCO AD ACCEDERE ALL'APP. COSA FARE?</h2>
              <p className="text-white/70">Assicurati di avere l'ultima versione. Se il problema persiste, <a href="#segnala" className="text-projectx-neon-blue underline font-semibold">segnala un problema</a>.</p>
            </div>
          </div>

          {/* Inizio form "Segnala un problema" */}
          <div id="segnala" className="mt-10 bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">📮 Segnala un problema</h2>
            <form method="POST" action="mailto:support@m1ssion.com" encType="text/plain" className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nome</label>
                <input 
                  type="text" 
                  id="name" 
                  name="Nome" 
                  required 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="Email" 
                  required 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50" 
                />
              </div>
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-white/80 mb-1">Descrizione del problema</label>
                <textarea 
                  id="issue" 
                  name="Problema" 
                  required 
                  rows={4} 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50 resize-none"
                ></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Invia
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default HelpFaq;
