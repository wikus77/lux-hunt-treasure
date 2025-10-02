// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Hook - Main facade for NORAH AI

import { useState, useCallback, useEffect } from 'react';
import { routeIntent } from './engine/intentRouter';
import { buildNorahContext, type NorahContext } from './engine/contextBuilder';
import {
  generateReply,
  generateMentorAdvice,
  detectPatterns,
  estimateProbability
} from './engine/replyGenerator';
import { addMessage, getMessages, type NorahMessage, fetchLastEpisode } from './state/messageStore';
import { logEvent } from './utils/telemetry';

export function useNorah() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<NorahContext | null>(null);
  const [messages, setMessages] = useState<NorahMessage[]>([]);

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  // v6.9: Enhanced episodic greeting - more visible and natural
  useEffect(() => {
    (async () => {
      try {
        const episode = await fetchLastEpisode({ timeoutMs: 300 });
        if (episode?.summary) {
          // v6.9: More natural, conversational greeting
          const greetings = [
            `Bentornato! L'ultima volta: "${episode.summary}". Continuiamo da lì?`,
            `Ehi! Ieri stavamo qui: "${episode.summary}". Ripartiamo o preferisci un recap?`,
            `Rieccoci! Ultima sessione: "${episode.summary}". Dove eravamo rimasti?`
          ];
          
          const greeting = greetings[Math.floor(Math.random() * greetings.length)];
          
          const greetingMsg: NorahMessage = {
            role: 'norah',
            content: greeting,
            timestamp: Date.now()
          };
          addMessage(greetingMsg);
          setMessages([...getMessages()]);
          
          await logEvent({ 
            event: 'episode_greeted',
            meta: { summary_length: episode.summary.length, greeting_variant: greeting.substring(0, 20) }
          });
          
          console.log('[NORAH v6.9] Episodic greeting displayed:', greeting);
        }
      } catch (error) {
        console.error('[Norah] Failed to load episodic greeting:', error);
      }
    })();
  }, []);

  const loadContext = useCallback(async () => {
    const ctx = await buildNorahContext();
    setContext(ctx);
    return ctx;
  }, []);

  const askNorah = useCallback(async (userInput: string): Promise<string> => {
    setIsProcessing(true);
    const startTime = Date.now(); // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

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

      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.5
      // Route intent (single arg signature)
      const intentResult = routeIntent(userInput);

      // Generate reply based on intent with unified signature
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
          reply = await generateReply(userInput); // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.7
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

      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      // v6.6: Log reply generation telemetry
      const elapsed = Date.now() - startTime;
      await logEvent({
        event: 'reply_generated',
        intent: intentResult.intent,
        sentiment: 'neutral',
        meta: { ms: elapsed }
      });

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
