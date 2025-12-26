// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Spectator Mode - Public Preview (No Auth Required)

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, Lock, Trophy, Map, Zap, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Track helper (lightweight, no external libs)
const track = (eventName: string, data: Record<string, unknown> = {}) => {
  const sessionId = sessionStorage.getItem('m1_session_id') || 
    `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('m1_session_id', sessionId);
  
  window.dispatchEvent(new CustomEvent("m1ssion:landing", { 
    detail: { action: eventName, ...data, sessionId } 
  }));
  
  // Send to edge function if available
  fetch('/functions/v1/track_event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_data: data,
      session_id: sessionId,
      path: window.location.pathname,
      referrer: document.referrer
    })
  }).catch(() => {}); // Silent fail
};

const SpectatorPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');

  const handleLockedFeature = (feature: string) => {
    setLockedFeature(feature);
    setShowLockedModal(true);
    track('spectator_locked_click', { feature });
  };

  const handleJoinMission = () => {
    track('spectator_join_click');
    setLocation('/register');
  };

  React.useEffect(() => {
    track('spectator_page_view');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold uppercase tracking-wider">
              <span className="text-cyan-400">SPECTATOR</span> MODE
            </span>
          </div>
          <Button
            onClick={handleJoinMission}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xs font-bold px-4 py-2 rounded-full"
          >
            ENTRA NELLA MISSIONE
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              PREVIEW MODE
            </p>
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-cyan-400">M1</span>SSION™
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-2">
              La Sfida Definitiva
            </p>
            <p className="text-base text-gray-400 max-w-xl mx-auto mb-8">
              Stai guardando M1SSION come spettatore. Per partecipare e vincere il premio reale, crea un account gratuito.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Preview Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Prize Preview */}
          <motion.div
            className="glass-container p-6 relative overflow-hidden border border-cyan-500/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">
                  Premi Reali
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Ogni mese un premio reale. Migliaia partecipano. Uno solo vince. Non è fortuna. È pattern recognition.
                </p>
                <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-cyan-400 mb-2">PREMIO ATTUALE</p>
                  <p className="text-lg font-bold text-white">Supercar + Esperienze Esclusive</p>
                  <p className="text-xs text-red-400 mt-2">
                    Ogni premio esiste una sola volta. Quando viene vinto, sparisce.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map Preview - Locked */}
          <motion.div
            className="glass-container p-6 relative overflow-hidden border border-white/10 cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => handleLockedFeature('Mappa Interattiva')}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-8 h-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Accesso riservato ai partecipanti</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Map className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">
                  Mappa Interattiva
                </h3>
                <p className="text-gray-400 text-sm">
                  Esplora la mappa, trova indizi, collegai i pattern. La posizione conta.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Buzz Preview - Locked */}
          <motion.div
            className="glass-container p-6 relative overflow-hidden border border-white/10 cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => handleLockedFeature('BUZZ Signal')}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-8 h-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Accesso riservato ai partecipanti</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">
                  BUZZ Signal
                </h3>
                <p className="text-gray-400 text-sm">
                  Premi il BUZZ per ricevere segnali. Ogni buzz rivela qualcosa. Usalo con saggezza.
                </p>
              </div>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="glass-container p-6 relative overflow-hidden border border-cyan-500/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4 text-center text-white">
              Come Funziona
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm font-bold text-cyan-400 mb-1">1. CERCA</p>
                <p className="text-xs text-gray-400">Trova gli indizi nascosti nella mappa</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🧩</div>
                <p className="text-sm font-bold text-cyan-400 mb-1">2. COLLEGA</p>
                <p className="text-xs text-gray-400">Riconosci i pattern tra gli indizi</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-sm font-bold text-cyan-400 mb-1">3. VINCI</p>
                <p className="text-xs text-gray-400">Chi capisce il sistema, vince il premio</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-white/50 text-sm mb-4">
              Smetti di guardare. Inizia a giocare.
            </p>
            <Button
              onClick={handleJoinMission}
              className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black text-lg font-black px-10 py-5 rounded-full hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] transition-all duration-300"
            >
              ENTRA NELLA MISSIONE
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Registrazione gratuita. Nessuna carta richiesta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Locked Feature Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 max-w-sm w-full text-center relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => setShowLockedModal(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">
              {lockedFeature}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Per accedere a questa funzione devi creare un account gratuito.
            </p>
            <Button
              onClick={handleJoinMission}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold py-3 rounded-full"
            >
              CREA ACCOUNT GRATUITO
            </Button>
          </motion.div>
        </div>
      )}

      {/* Simple Footer - Different from main footer */}
      <footer className="py-6 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2025 M1SSION™ — Spectator Preview
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SpectatorPage;

