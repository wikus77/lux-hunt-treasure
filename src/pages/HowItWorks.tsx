// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Target, Clock, Trophy, Users, ArrowLeft } from 'lucide-react';
import AnimatedLogo from '@/components/logo/AnimatedLogo';
import BackgroundParticles from '@/components/ui/background-particles';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles count={20} />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <AnimatedLogo />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-cyan-400">M1SSION™</span> è in arrivo
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Il gioco di realtà aumentata più avanzato al mondo. Preparati per un'esperienza senza precedenti.
          </p>
        </motion.div>

        {/* Countdown Display */}
        <motion.div
          className="text-center mb-16 p-8 bg-black/50 rounded-xl border border-cyan-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Clock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-cyan-400">LANCIO IMMINENTE</h2>
          <p className="text-xl text-gray-300">19 Agosto 2025 - 07:00 (UTC+2)</p>
          <p className="text-sm text-gray-500 mt-2">
            Hai completato la pre-registrazione. L'accesso sarà abilitato automaticamente al lancio.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-black/50 p-6 rounded-xl border border-gray-800">
            <Target className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Missioni Reali</h3>
            <p className="text-gray-400">
              Risolvi enigmi nel mondo reale utilizzando coordinate GPS precise e intelligence avanzata.
            </p>
          </div>

          <div className="bg-black/50 p-6 rounded-xl border border-gray-800">
            <Users className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Competizione Globale</h3>
            <p className="text-gray-400">
              Compete con agenti da tutto il mondo per raggiungere obiettivi strategici e vincere premi reali.
            </p>
          </div>

          <div className="bg-black/50 p-6 rounded-xl border border-gray-800">
            <Trophy className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Premi Esclusivi</h3>
            <p className="text-gray-400">
              Vinci premi fisici consegnati direttamente al tuo indirizzo per ogni missione completata.
            </p>
          </div>
        </motion.div>

        {/* Mission Timeline */}
        <motion.div
          className="bg-black/50 p-8 rounded-xl border border-cyan-500/30 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">
            Come Funziona M1SSION™
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg">Ricevi la Missione</h3>
                <p className="text-gray-400">
                  Ogni mese una nuova missione globale con coordinate segrete e indizi criptati.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg">Analizza gli Indizi</h3>
                <p className="text-gray-400">
                  Utilizza i nostri strumenti di intelligence per decifrare messaggi e calcolare posizioni.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg">Esegui il Final Shot</h3>
                <p className="text-gray-400">
                  Quando sei sicuro della posizione, esegui il tuo Final Shot per vincere la missione.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-cyan-400 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg">Vinci Premi Reali</h3>
                <p className="text-gray-400">
                  Ricevi premi fisici consegnati al tuo indirizzo e accedi al livello successivo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-cyan-400">
            Sei Pronto per la M1SSION™?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            La tua pre-registrazione è confermata. Torna qui il 19 Agosto 2025 alle 07:00 per iniziare la tua prima missione.
          </p>
          
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Torna al Login
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-gray-500 text-sm">
            © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;