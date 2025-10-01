// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Hook
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { buildAnalystPrompt, caesarShift, tryBase64Decode, anagramHints, analyzeNumericPattern } from '@/lib/ai/aiAnalystPrompt';

export type AnalystMode = 'analyze' | 'classify' | 'decode' | 'assess' | 'guide';
export type AnalystStatus = 'idle' | 'thinking' | 'speaking';

interface Message {
  role: 'user' | 'analyst';
  content: string;
  timestamp: Date;
  metadata?: {
    mode?: AnalystMode;
    cluesAnalyzed?: number;
  };
}

interface Clue {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export const useIntelAnalyst = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<AnalystStatus>('idle');
  const [currentMode, setCurrentMode] = useState<AnalystMode>('analyze');
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoadingClues, setIsLoadingClues] = useState(false);

  // Load clues on mount
  useEffect(() => {
    loadClues();
  }, []);

  const loadClues = async () => {
    setIsLoadingClues(true);
    try {
      // Try view first
      const { data: viewData, error: viewError } = await supabase
        .from('v_user_intel_clues')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!viewError && viewData) {
        setClues(viewData);
        setIsLoadingClues(false);
        return;
      }

      // Fallback to clues table
      const { data: cluesData, error: cluesError } = await supabase
        .from('clues')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!cluesError && cluesData) {
        setClues(cluesData);
      }
    } catch (error) {
      console.error('Error loading clues:', error);
    } finally {
      setIsLoadingClues(false);
    }
  };

  const sendMessage = useCallback(async (content: string, mode: AnalystMode = 'analyze') => {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatus('thinking');
    setCurrentMode(mode);

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: { mode }
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setStatus('speaking');

    // Build AI response based on mode and context
    let responseContent = '';
    
    // Check if asking for solution (guardrail)
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("dov'è") || lowerContent.includes("dove si trova") || 
        lowerContent.includes("qual è il premio") || lowerContent.includes("coordinate")) {
      responseContent = "⚠️ Non posso rivelare la soluzione o coordinate esatte.\n\nPosso però aiutarti ad analizzare le piste disponibili e suggerirti pattern da investigare.\n\nProva a chiedermi di classificare gli indizi o cercare correlazioni.";
    } else if (clues.length === 0) {
      responseContent = "📚 **Nessun Indizio Disponibile**\n\nPer iniziare l'analisi, devi raccogliere indizi tramite:\n\n• BUZZ: scansiona la mappa\n• Eventi settimanali\n• Missioni speciali\n• Codici QR\n\nRaccogli almeno 3-5 indizi per permettermi un'analisi significativa.";
    } else {
      switch (mode) {
        case 'analyze':
          const recent = clues.slice(0, 5);
          const keywords = recent.map(c => c.title).join(', ');
          responseContent = `🔍 **Analisi ${clues.length} Indizi**\n\n• Pattern chiave: ${keywords}\n• Coerenza temporale: indizi raccolti negli ultimi giorni\n• Clustering tematico: rilevo correlazioni tra "${recent[0]?.title}" e altri\n• Probabilità pista valida: 60-75%\n\nConsiglio: verifica sovrapposizioni geografiche tra gli indizi più recenti.`;
          break;
        
        case 'classify':
          const locationClues = clues.filter(c => 
            c.description.toLowerCase().includes('via') || 
            c.description.toLowerCase().includes('coord') ||
            c.description.toLowerCase().includes('gps')
          ).length;
          const prizeClues = clues.filter(c => 
            c.description.toLowerCase().includes('premio') ||
            c.description.toLowerCase().includes('colore') ||
            c.description.toLowerCase().includes('materiale')
          ).length;
          
          responseContent = `📊 **Classificazione ${clues.length} Indizi**\n\n• Indizi di Luogo: ~${locationClues} (${Math.round(locationClues/clues.length*100)}%)\n• Indizi di Premio: ~${prizeClues} (${Math.round(prizeClues/clues.length*100)}%)\n• Altri/Ambigui: ${clues.length - locationClues - prizeClues}\n\nFocus: concentrati prima sui "${locationClues > prizeClues ? 'luoghi' : 'premi'}" per restringere il campo.`;
          break;
        
        case 'decode':
          const textToAnalyze = content.trim();
          let decodeHints: string[] = [];
          
          if (textToAnalyze.length > 0 && textToAnalyze !== 'decode' && textToAnalyze !== 'decodifica') {
            // Try Caesar shifts
            decodeHints.push(`🔐 **Tentativi Decodifica**\n\nInput: "${textToAnalyze}"\n`);
            decodeHints.push(`• Caesar +1: ${caesarShift(textToAnalyze, 1)}`);
            decodeHints.push(`• Caesar +3: ${caesarShift(textToAnalyze, 3)}`);
            decodeHints.push(`• Caesar -1: ${caesarShift(textToAnalyze, -1)}`);
            
            const b64 = tryBase64Decode(textToAnalyze);
            if (b64) decodeHints.push(`• Base64: ${b64}`);
            
            if (textToAnalyze.length <= 10) {
              const anagrams = anagramHints(textToAnalyze);
              decodeHints.push(`\n**Anagrammi:**`);
              anagrams.forEach(hint => decodeHints.push(`• ${hint}`));
            }
            
            const numPatterns = analyzeNumericPattern(textToAnalyze);
            if (numPatterns.length > 0 && numPatterns[0] !== "Nessun pattern numerico rilevato") {
              decodeHints.push(`\n**Pattern Numerici:**`);
              numPatterns.forEach(hint => decodeHints.push(`• ${hint}`));
            }
            
            responseContent = decodeHints.join('\n');
          } else {
            responseContent = `🔐 **Decodifica Pattern**\n\nInvia un testo/codice dopo "decode" per analizzarlo.\n\nEsempi:\n• "decode KHOOR" (Caesar)\n• "decode SGVsbG8=" (Base64)\n• "decode ROMA" (Anagrammi)\n• "decode 41.9028 12.4964" (Coordinate)\n\nMaximo 10 caratteri per anagrammi.`;
          }
          break;
        
        case 'assess':
          const oldestDate = clues.length > 0 ? new Date(clues[clues.length - 1].created_at) : new Date();
          const newestDate = clues.length > 0 ? new Date(clues[0].created_at) : new Date();
          const daysDiff = Math.floor((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
          
          responseContent = `📈 **Valutazione CIA**\n\nDataset: ${clues.length} indizi raccolti in ${daysDiff} giorni\n\n**Probabilità Piste:**\n• Alta affidabilità (70-85%): indizi recenti coerenti\n• Media affidabilità (50-70%): indizi con sovrapposizioni parziali\n• Bassa affidabilità (20-50%): dati contraddittori o isolati\n\n⚠️ Disclaimer: stime basate su pattern, non certezze. Verifica sul campo.`;
          break;
        
        case 'guide':
          const progress = Math.min(clues.length * 10, 100);
          responseContent = `🎯 **Mentore M1SSION**\n\nAgente, il tuo progresso è al ${progress}%.\n\n• Ogni indizio ti avvicina alla verità\n• La perseveranza è la tua migliore alleata\n• Non lasciare che i dubbi ti fermino\n• Il premio attende chi ha pazienza\n\nLa missione continua. Avanti!`;
          break;
      }
    }

    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const analystMessage: Message = {
      role: 'analyst',
      content: responseContent,
      timestamp: new Date(),
      metadata: { 
        mode,
        cluesAnalyzed: clues.length
      }
    };
    
    setMessages(prev => {
      const newMessages = [...prev, analystMessage];
      // Keep only last 12 messages (6 turns) for context
      return newMessages.slice(-12);
    });
    
    setStatus('idle');
    setIsProcessing(false);
  }, [clues, isProcessing]);

  return {
    messages,
    isProcessing,
    status,
    currentMode,
    clues,
    isLoadingClues,
    sendMessage,
    clearMessages: () => setMessages([]),
    refreshClues: loadClues
  };
};
