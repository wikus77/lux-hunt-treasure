// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Hook - Main facade for NORAH AI

import { useState, useCallback } from 'react';
import { routeIntent } from './engine/intentRouter';
import { buildNorahContext, type NorahContext } from './engine/contextBuilder';
import {
  generateReply,
  generateMentorAdvice,
  detectPatterns,
  estimateProbability
} from './engine/replyGenerator';
import { addMessage, getMessages, type NorahMessage } from './state/messageStore';

export function useNorah() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<NorahContext | null>(null);
  const [messages, setMessages] = useState<NorahMessage[]>([]);

  const loadContext = useCallback(async () => {
    const ctx = await buildNorahContext();
    setContext(ctx);
    return ctx;
  }, []);

  const askNorah = useCallback(async (userInput: string): Promise<string> => {
    setIsProcessing(true);

    try {
      // Add user message
      const userMsg: NorahMessage = {
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      };
      addMessage(userMsg);
      setMessages([...getMessages()]);

      // Load/refresh context
      const ctx = await buildNorahContext();
      setContext(ctx);

      // Route intent
      const intentResult = routeIntent(userInput);

      // Generate reply based on intent
      let reply = '';
      
      switch (intentResult.intent) {
        case 'mentor':
          reply = generateMentorAdvice(ctx);
          break;
        case 'pattern':
          reply = detectPatterns(ctx);
          break;
        case 'probability':
          reply = estimateProbability(ctx);
          break;
        default:
          reply = generateReply(intentResult, ctx, userInput);
      }

      // Add Norah response
      const norahMsg: NorahMessage = {
        role: 'norah',
        content: reply,
        intent: intentResult.intent,
        timestamp: Date.now()
      };
      addMessage(norahMsg);
      setMessages([...getMessages()]);

      return reply;

    } catch (error) {
      console.error('[Norah] Ask failed:', error);
      return 'Errore di comunicazione. Riprova.';
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const loadReadyBanner = useCallback(() => {
    return context 
      ? `NORAH Intelligence Ready • Agente ${context.agent.code}`
      : 'NORAH Intelligence Ready';
  }, [context]);

  return {
    askNorah,
    loadContext,
    loadReadyBanner,
    isProcessing,
    context,
    messages
  };
}
