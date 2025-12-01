// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Hook with Natural Responder
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateReply, type AnalystMode } from '@/lib/ai/analystEngine';
import { getAgentContext as getOldContext } from '@/intelligence/context/aiContext';
import { getAgentContext, refreshContext, type AgentContextData } from '@/intel/ai/context/agentContext';
import { useRealtimeIntel } from '@/intel/ai/context/realtimeClues';
import { composeReply } from '@/intel/ai/ui/aiPanelBehavior';

export type { AnalystMode };
export type AnalystStatus = 'idle' | 'thinking' | 'speaking';

export interface AnalystMessage {
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
  const [messages, setMessages] = useState<AnalystMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<AnalystStatus>('idle');
  const [currentMode, setCurrentMode] = useState<AnalystMode>('analyze');
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoadingClues, setIsLoadingClues] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // ON by default - AION must speak!
  const [audioLevel, setAudioLevel] = useState(0);
  const [agentContext, setAgentContext] = useState<AgentContextData | null>(null);
  
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  const voicesLoadedRef = useRef(false);

  // Use realtime intel hook
  const { clues: realtimeClues, loading: realtimeLoading } = useRealtimeIntel();

  // Load context and user on mount
  useEffect(() => {
    loadUserId();
    loadAgentContext();
    
    // iOS Safari TTS warmup: force voice loading
    if ('speechSynthesis' in window) {
      // Trigger voice loading
      window.speechSynthesis.getVoices();
      
      // Load voices async
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🔊 TTS voices loaded:', voices.length);
        voicesLoadedRef.current = true;
      };
      
      // iOS Safari: unlock TTS on first user interaction
      const unlockTTS = () => {
        if ('speechSynthesis' in window) {
          const warmup = new SpeechSynthesisUtterance('');
          warmup.volume = 0;
          window.speechSynthesis.speak(warmup);
          console.log('🔊 TTS unlocked via user interaction');
        }
        // Remove listeners after first interaction
        document.removeEventListener('touchstart', unlockTTS);
        document.removeEventListener('click', unlockTTS);
      };
      
      document.addEventListener('touchstart', unlockTTS, { once: true });
      document.addEventListener('click', unlockTTS, { once: true });
    }
  }, []);

  // Sync realtime clues to local clues
  useEffect(() => {
    setClues(realtimeClues as any);
    setIsLoadingClues(realtimeLoading);
  }, [realtimeClues, realtimeLoading]);

  const loadAgentContext = async () => {
    const ctx = await getAgentContext();
    setAgentContext(ctx);
  };

  const loadUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userIdRef.current = user.id;
    }
  };

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) {
      console.log('🔊 TTS skipped: enabled=', ttsEnabled);
      return;
    }
    
    console.log('🔊 TTS attempting to speak:', text.substring(0, 50) + '...');
    
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();
    
    // Core speak function
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get best voice (prefer Italian)
      const voices = window.speechSynthesis.getVoices();
      console.log('🔊 Available voices:', voices.length);
      
      const italianVoice = voices.find(v => 
        v.lang === 'it-IT' || v.lang.startsWith('it')
      ) || voices.find(v => 
        v.name.toLowerCase().includes('italian') || v.name.toLowerCase().includes('italy')
      );
      
      if (italianVoice) {
        utterance.voice = italianVoice;
        console.log('🔊 Using voice:', italianVoice.name);
      } else if (voices.length > 0) {
        // Fallback to first available voice
        utterance.voice = voices[0];
        console.log('🔊 Fallback voice:', voices[0].name);
      }
      
      // Audio level animation
      let intervalId: NodeJS.Timeout;
      
      utterance.onstart = () => {
        console.log('🔊 TTS STARTED');
        intervalId = setInterval(() => {
          setAudioLevel(Math.random() * 0.8 + 0.2);
        }, 100);
      };
      
      utterance.onend = () => {
        console.log('🔊 TTS ENDED');
        clearInterval(intervalId);
        setAudioLevel(0);
      };
      
      utterance.onerror = (e) => {
        console.error('🔊 TTS ERROR:', e.error);
        clearInterval(intervalId);
        setAudioLevel(0);
        
        // Retry once on error (iOS sometimes fails first time)
        if (e.error !== 'canceled') {
          console.log('🔊 Retrying TTS...');
          setTimeout(() => {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
          }, 300);
        }
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    
    // Ensure voices are loaded before speaking
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      // Voices ready, speak immediately
      doSpeak();
    } else {
      // iOS Safari: wait for voices with multiple fallbacks
      console.log('🔊 Waiting for voices to load...');
      
      const trySpeak = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) {
          doSpeak();
          return true;
        }
        return false;
      };
      
      // Method 1: onvoiceschanged event
      const handler = () => {
        if (trySpeak()) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
      window.speechSynthesis.onvoiceschanged = handler;
      
      // Method 2: Polling fallback (iOS sometimes doesn't fire event)
      let attempts = 0;
      const pollInterval = setInterval(() => {
        attempts++;
        if (trySpeak() || attempts > 10) {
          clearInterval(pollInterval);
          window.speechSynthesis.onvoiceschanged = null;
        }
      }, 200);
      
      // Method 3: Final timeout fallback
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!trySpeak()) {
          console.warn('🔊 TTS: Could not load voices, speaking anyway...');
          doSpeak(); // Try anyway
        }
      }, 2000);
    }
  }, [ttsEnabled]);

  const sendMessage = useCallback(async (content: string, mode: AnalystMode = 'analyze') => {
    if (!content.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatus('thinking');
    setCurrentMode(mode);

    const userMessage: AnalystMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: { mode }
    };

    setMessages(prev => [...prev, userMessage]);

    // Thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setStatus('speaking');

    // Use V2 panel behavior if context available
    let response: string;
    if (agentContext) {
      response = await composeReply({
        mode,
        userText: content,
        context: agentContext,
        clues: realtimeClues as any
      });
    } else {
      // Fallback to existing engine
      const engineResponse = await generateReply({
        mode,
        clues,
        userText: content,
        userId: userIdRef.current,
        timestamp: Date.now()
      });
      response = engineResponse.content;
    }

    // Simulate streaming
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const analystMessage: AnalystMessage = {
      role: 'analyst',
      content: response,
      timestamp: new Date(),
      metadata: { 
        mode,
        cluesAnalyzed: clues.length
      }
    };
    
    setMessages(prev => {
      const newMessages = [...prev, analystMessage];
      return newMessages.slice(-12); // Keep last 6 turns
    });
    
    // TTS if enabled
    if (ttsEnabled) {
      speakText(response);
    }
    
    setStatus('idle');
    setIsProcessing(false);
  }, [realtimeClues, isProcessing, ttsEnabled, speakText, agentContext]);

  const toggleTTS = useCallback(() => {
    const newEnabled = !ttsEnabled;
    setTtsEnabled(newEnabled);
    
    if (!newEnabled && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setAudioLevel(0);
    }
    
    // iOS Safari: "unlock" audio on user interaction by speaking empty/silent
    if (newEnabled && 'speechSynthesis' in window) {
      // This user-initiated call unlocks TTS on iOS
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis.speak(warmup);
      console.log('🔊 TTS enabled & unlocked for iOS');
    }
  }, [ttsEnabled]);

  return {
    messages,
    isProcessing,
    status,
    currentMode,
    clues,
    isLoadingClues,
    ttsEnabled,
    audioLevel,
    agentContext,
    sendMessage,
    clearMessages: () => setMessages([]),
    refreshClues: async () => {
      await refreshContext();
      await loadAgentContext();
    },
    toggleTTS
  };
};
