/**
 * M1SSION™ Motivational Popup System
 * Shows contextual motivational messages when entering pages
 * GREEN GLASS STYLE - AAA Game Feel
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Map, Zap, Brain, Trophy, MessageCircle, Home, Target } from 'lucide-react';
import { playSound } from './audioFeedback';

// 🎯 MOTIVATIONAL MESSAGES BY PAGE TYPE
const MESSAGES = {
  map: [
    { title: '📡 SEGNALE TROVATO IN ITALIA', description: 'Esplora la mappa e trova i tuoi premi!' },
    { title: '🗺️ NUOVO PATTERN IN OLANDA', description: '99 premi ti attendono sulla mappa' },
    { title: '📍 SEGNALE TROVATO IN GERMANIA', description: 'Esplora la mappa e trova i tuoi premi!' },
    { title: '🎯 AGENT, MISSIONE ATTIVA', description: 'Trova il punto esatto del premio finale!' },
    { title: '🔴 BUZZ MAP RICHIESTO', description: 'Premi BUZZ MAP per sbloccare la zona premio!' },
    { title: '🌍 COORDINATE RILEVATE', description: 'Un premio è nascosto in questa zona. Cercalo!' },
    { title: '📶 ANOMALIA RILEVATA', description: 'Il segnale indica una ricompensa vicina!' },
    { title: '🗺️ ESPLORA LA MAPPA', description: 'Marker verdi = premi sicuri. Trovane 99!' },
    { title: '⚡ SEGNALE FORTE IN SPAGNA', description: 'I tuoi premi sono pronti. Vai a prenderli!' },
    { title: '🎯 NUOVA AREA SBLOCCATA', description: 'Premi BUZZ MAP per rivelare i premi nascosti' },
    { title: '📍 FRANCIA: PREMI DISPONIBILI', description: 'Esplora e riscatta le tue ricompense!' },
    { title: '🔥 BONUS AREA ATTIVA', description: 'Questa zona contiene premi extra. Esplora!' },
    { title: '🎁 99 MARKER TI ATTENDONO', description: 'Ogni marker verde = un premio garantito!' },
    { title: '📡 INTERFERENZA POSITIVA', description: 'Segnale premio rilevato. Avvicinati!' },
    { title: '🗺️ MAPPA AGGIORNATA', description: 'Nuovi premi sono stati posizionati. Cercali!' },
    { title: '🎯 AGENT, LA CACCIA CONTINUA', description: 'Trova tutti i 99 premi sulla mappa!' },
    { title: '💎 PREMIO RARO IN ZONA', description: 'Un marker speciale ti attende!' },
    { title: '📍 BELGIO: SEGNALE ATTIVO', description: 'Premi disponibili in quest\'area!' },
    { title: '🌟 ZONA HOT RILEVATA', description: 'Alta concentrazione di premi qui!' },
    { title: '🔴 BUZZ MAP = CHIAVE', description: 'Sblocca l\'area per vedere i premi nascosti!' },
  ],
  buzz: [
    { title: '⚡ BUZZ PRONTO', description: 'Ogni BUZZ ti avvicina al premio finale!' },
    { title: '🎯 RACCOGLI INDIZI', description: 'Più indizi = più alto il tuo livello Agent!' },
    { title: '💎 BUZZ = POTERE', description: 'Ogni press ti dà M1U e progressi!' },
    { title: '🔥 AGENT, È IL TUO MOMENTO', description: 'Premi BUZZ e scala la classifica!' },
    { title: '⚡ ENERGIA CARICA', description: 'Il tuo BUZZ è pronto. Usalo!' },
    { title: '🎯 LEVEL UP VICINO', description: 'Ancora pochi BUZZ per il prossimo livello!' },
    { title: '💰 M1U IN ARRIVO', description: 'Ogni BUZZ = cashback garantito!' },
    { title: '🚀 BOOST DISPONIBILE', description: 'Premi BUZZ per accelerare i tuoi progressi!' },
    { title: '⚡ BUZZ STREAK ATTIVA', description: 'Continua a premere per bonus extra!' },
    { title: '🏆 DIVENTA IL MIGLIORE', description: 'Più BUZZ = posizione più alta in classifica!' },
    { title: '💎 INDIZIO NASCOSTO', description: 'Il prossimo BUZZ potrebbe svelarlo!' },
    { title: '🔥 AGENT IN MISSIONE', description: 'Non fermarti. Il premio ti aspetta!' },
    { title: '⚡ CARICA COMPLETA', description: 'Rilascia l\'energia con un BUZZ!' },
    { title: '🎯 OBIETTIVO GIORNALIERO', description: 'Completa i tuoi BUZZ quotidiani!' },
    { title: '💰 CASHBACK ACCUMULATO', description: 'Ogni BUZZ aumenta il tuo vault!' },
  ],
  aion: [
    { title: '🤖 AION TI ATTENDE', description: 'L\'AI analyst ha nuovi insights per te!' },
    { title: '🧠 INTELLIGENCE READY', description: 'Analisi avanzate disponibili!' },
    { title: '📊 DATI ELABORATI', description: 'AION ha trovato pattern interessanti!' },
    { title: '🔍 NUOVE SCOPERTE', description: 'L\'AI ha rilevato opportunità per te!' },
    { title: '💡 INSIGHT DISPONIBILE', description: 'Chiedi ad AION e ottieni risposte!' },
    { title: '🤖 AGENT, PARLAMI', description: 'AION è pronto ad aiutarti nella missione!' },
    { title: '📈 ANALISI COMPLETATA', description: 'Risultati pronti. Consulta AION!' },
    { title: '🧠 AI POTENZIATO', description: 'AION ha nuove capacità. Provale!' },
    { title: '🔮 PREDIZIONI AGGIORNATE', description: 'L\'AI ha elaborato nuovi scenari!' },
    { title: '💎 SEGRETO SVELATO', description: 'AION conosce la strada verso il premio!' },
  ],
  leaderboard: [
    { title: '🏆 CLASSIFICA LIVE', description: 'Vedi la tua posizione tra gli Agent!' },
    { title: '📊 TOP AGENTS', description: 'Scala la classifica e diventa il migliore!' },
    { title: '🥇 PODIO DISPONIBILE', description: 'Sfida gli altri e conquista la vetta!' },
    { title: '🔥 COMPETIZIONE ATTIVA', description: 'La classifica si aggiorna in tempo reale!' },
    { title: '🏆 RANKING MONDIALE', description: 'Confrontati con Agent da tutto il mondo!' },
    { title: '⚡ POSIZIONE IN SALITA', description: 'Continua così per raggiungere il top!' },
    { title: '🎯 OBIETTIVO: TOP 10', description: 'Sei vicino alla top 10. Non mollare!' },
    { title: '💎 PREMI ESCLUSIVI', description: 'I top Agent ricevono bonus speciali!' },
    { title: '🏅 SFIDA ACCETTATA', description: 'Mostra di che pasta sei fatto!' },
    { title: '🚀 CORSA AL VERTICE', description: 'Ogni azione conta per la classifica!' },
  ],
  home: [
    { title: '🏠 BENTORNATO AGENT', description: 'La tua missione continua!' },
    { title: '📊 PROGRESSI SALVATI', description: 'Continua da dove hai lasciato!' },
    { title: '🎯 NUOVA GIORNATA', description: 'Nuove opportunità ti aspettano!' },
    { title: '💎 PREMI IN ATTESA', description: 'Controlla i tuoi reward!' },
    { title: '🔥 STREAK ATTIVA', description: 'Non perdere il tuo bonus giornaliero!' },
    { title: '🚀 READY FOR ACTION', description: 'Scegli la tua prossima mossa!' },
    { title: '📈 LIVELLO IN CRESCITA', description: 'Sei sempre più vicino al top!' },
    { title: '🎁 SORPRESA IN ARRIVO', description: 'Controlla la ruota della fortuna!' },
    { title: '⚡ ENERGIA PIENA', description: 'È il momento perfetto per agire!' },
    { title: '🏆 AGENT OPERATIVO', description: 'Missione in corso. Buona fortuna!' },
  ],
  forum: [
    { title: '💬 COMMUNITY ATTIVA', description: 'Unisciti alla discussione!' },
    { title: '🗣️ LA TUA VOCE CONTA', description: 'Condividi le tue strategie!' },
    { title: '📢 NUOVI POST', description: 'Altri Agent hanno condiviso tips!' },
    { title: '🤝 CONNETTI CON ALTRI', description: 'La community ti aspetta!' },
    { title: '💡 IDEE BRILLANTI', description: 'Scopri i segreti degli altri Agent!' },
    { title: '🔥 HOT TOPIC', description: 'Discussione accesa nel forum!' },
    { title: '📝 LASCIA UN COMMENTO', description: 'La tua opinione è importante!' },
    { title: '🏅 BEST CONTRIBUTOR', description: 'Partecipa e guadagna reputazione!' },
  ],
};

type PageType = keyof typeof MESSAGES;

interface MotivationalPopupProps {
  pageType: PageType;
  showOnce?: boolean; // Show only once per session
  delay?: number; // Delay before showing
}

// Track shown popups per session
const shownPopups = new Set<string>();

export const MotivationalPopup: React.FC<MotivationalPopupProps> = ({
  pageType,
  showOnce = true,
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    const key = `motivational_${pageType}`;
    
    // Check if already shown this session
    if (showOnce && shownPopups.has(key)) {
      return;
    }

    // Get random message
    const pageMessages = MESSAGES[pageType];
    const randomIndex = Math.floor(Math.random() * pageMessages.length);
    setMessage(pageMessages[randomIndex]);

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      shownPopups.add(key);
      playSound('confirm');
    }, delay);

    return () => clearTimeout(timer);
  }, [pageType, showOnce, delay]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getIcon = () => {
    switch (pageType) {
      case 'map': return <Map className="w-8 h-8" />;
      case 'buzz': return <Zap className="w-8 h-8" />;
      case 'aion': return <Brain className="w-8 h-8" />;
      case 'leaderboard': return <Trophy className="w-8 h-8" />;
      case 'home': return <Home className="w-8 h-8" />;
      case 'forum': return <MessageCircle className="w-8 h-8" />;
      default: return <Target className="w-8 h-8" />;
    }
  };

  if (!message || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
              border: '2px solid rgba(0, 255, 136, 0.5)',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.3), 0 12px 40px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Ambient glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.2) 0%, transparent 60%)',
              }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                  boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
                }}
              >
                <span className="text-black">{getIcon()}</span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-3"
                style={{
                  color: '#00FF88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
                }}
              >
                {message.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg mb-6"
              >
                {message.description}
              </motion.p>

              {/* CTA Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleClose}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 35px rgba(0, 255, 136, 0.6)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                  color: '#000',
                  boxShadow: '0 4px 25px rgba(0, 255, 136, 0.4)',
                }}
              >
                CONTINUA <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: 'rgba(0, 255, 136, 0.3)' }}
              >
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full origin-left"
                  style={{ background: '#00FF88' }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MotivationalPopup;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

