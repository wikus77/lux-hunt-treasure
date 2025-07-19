// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Hook per comunicazione con M1SSION PANEL™ AI

import { useState, useCallback } from 'react';

export interface PanelMessage {
  id: string;
  role: 'panel' | 'user';
  content: string;
  timestamp: number;
}

export interface PanelResponse {
  role: 'panel' | 'user';
  content: string;
}

interface UsePanelAIReturn {
  history: PanelMessage[];
  isProcessing: boolean;
  sendMessage: (text: string) => Promise<PanelResponse>;
  clearHistory: () => void;
  getLastPanelResponse: () => string | null;
}

// Risposte hardcoded del M1SSION PANEL™
const PANEL_RESPONSES = {
  greeting: [
    "🎯 M1SSION PANEL™ ONLINE. Accesso autorizzato rilevato.",
    "⚡ SISTEMA ATTIVO. Attendere istruzioni operative.",
    "🔐 CONNESSIONE SICURA STABILITA. Panel ready for commands."
  ],
  mission_status: [
    "📊 MISSION STATUS: Operazione in corso. 47 agenti attivi sul campo.",
    "🗺️ AREA MAPPATURA: Radius dinamico calcolato in base ai partecipanti.",
    "⏰ TIMELINE: Fase 2 di 4 completata. Prossimo milestone in 72 ore."
  ],
  clue_management: [
    "🧩 INDIZI: 200 elementi generati. Distribuzione tier conforme al protocollo.",
    "🎲 DECOY STATUS: 12 false flag attive per confusion protocol.",
    "📈 ENGAGEMENT: Pattern di risoluzione entro parametri previsti."
  ],
  week_control: [
    "🚀 WEEK 3 RELEASE: Attivazione indizi microzona autorizzata.",
    "⚠️ PROTOCOL ALERT: Release anticipato richiede conferma Level-7.",
    "✅ SEQUENZA ATTIVATA: Nuovo batch indizi disponibile per tier Gold+."
  ],
  system_operations: [
    "🔧 SYSTEM CHECK: Tutti i moduli operativi. Latenza: 23ms.",
    "💾 DATABASE SYNC: 99.7% integrità dati confermata.",
    "🛡️ SECURITY SCAN: Nessuna anomalia rilevata nel perimetro."
  ],
  emergency: [
    "🚨 EMERGENCY PROTOCOL: Standby mode attivato. Operazioni sospese.",
    "⛔ LOCKDOWN ENGAGED: Accesso limitato fino a clearance amministrativo.",
    "🔒 FAIL-SAFE ACTIVE: Sistema in modalità sicura. Attendere reset."
  ],
  analytics: [
    "📊 ANALYTICS REPORT: 89% completion rate settimana corrente.",
    "📈 USER ENGAGEMENT: Picco attività registrato nelle ore serali.",
    "🎯 TARGET EFFICIENCY: Algoritmo predittivo aggiornato con nuovi pattern."
  ],
  unknown: [
    "❓ COMANDO NON RICONOSCIUTO. Consultare documentazione Panel.",
    "🤖 PROCESSING ERROR: Richiesta ambigua. Specificare parametri.",
    "⚡ ELABORAZIONE ALTERNATIVA: Interpretazione basata su context matching."
  ]
};

const generatePanelResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Analizza il contenuto del messaggio per determinare la risposta appropriata
  if (message.includes('ciao') || message.includes('hello') || message.includes('salve')) {
    return getRandomResponse('greeting');
  }
  
  if (message.includes('mission') || message.includes('stato') || message.includes('status')) {
    return getRandomResponse('mission_status');
  }
  
  if (message.includes('indizi') || message.includes('clue') || message.includes('hint')) {
    return getRandomResponse('clue_management');
  }
  
  if (message.includes('week') || message.includes('settimana') || message.includes('release')) {
    return getRandomResponse('week_control');
  }
  
  if (message.includes('system') || message.includes('check') || message.includes('sync')) {
    return getRandomResponse('system_operations');
  }
  
  if (message.includes('emergency') || message.includes('stop') || message.includes('emergenza')) {
    return getRandomResponse('emergency');
  }
  
  if (message.includes('analytics') || message.includes('report') || message.includes('statistiche')) {
    return getRandomResponse('analytics');
  }
  
  // Default per messaggi non riconosciuti
  return getRandomResponse('unknown');
};

const getRandomResponse = (category: keyof typeof PANEL_RESPONSES): string => {
  const responses = PANEL_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const usePanelAI = (): UsePanelAIReturn => {
  const [history, setHistory] = useState<PanelMessage[]>([
    {
      id: generateMessageId(),
      role: 'panel',
      content: '🎯 M1SSION PANEL™ INIZIALIZZATO. Sistema operativo pronto per comandi.',
      timestamp: Date.now()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (text: string): Promise<PanelResponse> => {
    if (!text.trim() || isProcessing) {
      return { role: 'user', content: text };
    }

    setIsProcessing(true);

    // Aggiungi messaggio utente alla cronologia
    const userMessage: PanelMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, userMessage]);

    // Simula tempo di elaborazione del Panel (1-3 secondi)
    const processingDelay = Math.random() * 2000 + 1000; // 1000-3000ms

    return new Promise((resolve) => {
      setTimeout(() => {
        // Genera risposta del Panel
        const panelResponseContent = generatePanelResponse(text);
        
        const panelMessage: PanelMessage = {
          id: generateMessageId(),
          role: 'panel',
          content: panelResponseContent,
          timestamp: Date.now()
        };

        setHistory(prev => [...prev, panelMessage]);
        setIsProcessing(false);

        const response: PanelResponse = {
          role: 'panel',
          content: panelResponseContent
        };

        resolve(response);
      }, processingDelay);
    });
  }, [isProcessing]);

  const clearHistory = useCallback(() => {
    setHistory([
      {
        id: generateMessageId(),
        role: 'panel',
        content: '🔄 CRONOLOGIA CANCELLATA. M1SSION PANEL™ pronto per nuova sessione.',
        timestamp: Date.now()
      }
    ]);
  }, []);

  const getLastPanelResponse = useCallback((): string | null => {
    const panelMessages = history.filter(msg => msg.role === 'panel');
    return panelMessages.length > 0 ? panelMessages[panelMessages.length - 1].content : null;
  }, [history]);

  return {
    history,
    isProcessing,
    sendMessage,
    clearHistory,
    getLastPanelResponse
  };
};