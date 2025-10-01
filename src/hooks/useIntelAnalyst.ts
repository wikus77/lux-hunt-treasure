// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Hook with Natural Responder
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateReply, type AnalystMode } from '@/lib/ai/analystEngine';
import { getAgentContext, subscribeToContext, type AgentContext } from '@/intelligence/context/aiContext';
import { generateNaturalResponse, detectIntent } from '@/intelligence/engine/naturalResponder';

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
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null);
  
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  // Load context and clues on mount
  useEffect(() => {
    loadClues();
    loadUserId();
    loadAgentContext();
    
    // Subscribe to context updates
    const unsubscribe = subscribeToContext((ctx) => {
      if (ctx) {
        setAgentContext(ctx);
      }
    });
    
    return unsubscribe;
  }, []);

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

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Simulate audio level during speech
    let intervalId: NodeJS.Timeout;
    utterance.onstart = () => {
      intervalId = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2); // 0.2-1.0
      }, 100);
    };
    
    utterance.onend = () => {
      clearInterval(intervalId);
      setAudioLevel(0);
    };
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
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

    // Try natural responder if context is available
    let response: string;
    if (agentContext) {
      const intent = detectIntent(content);
      const seed = Date.now() ^ (userIdRef.current?.charCodeAt(0) || 0);
      
      response = generateNaturalResponse({
        prompt: content,
        intent,
        context: agentContext,
        clues,
        seed
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
  }, [clues, isProcessing, ttsEnabled, speakText, agentContext]);

  const toggleTTS = useCallback(() => {
    setTtsEnabled(prev => !prev);
    if (ttsEnabled && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setAudioLevel(0);
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
    refreshClues: loadClues,
    toggleTTS
  };
};
