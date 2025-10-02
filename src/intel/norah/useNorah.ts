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
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// v7.0: Enhanced imports
import { trackEmotion, getEmotionalContext, getAdaptiveEmpathy, persistEmotionalContext } from './engine/emotionalContext';
import { getTimeContext, getTimeAwareGreeting } from './engine/personalization';
import { detectSentiment } from './engine/sentiment';

export function useNorah() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<NorahContext | null>(null);
  const [messages, setMessages] = useState<NorahMessage[]>([]);

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
  // v7.0: Enhanced episodic greeting with time-awareness
  useEffect(() => {
    (async () => {
      try {
        const episode = await fetchLastEpisode({ timeoutMs: 300 });
        const timeGreeting = getTimeAwareGreeting();
        
        if (episode?.summary) {
          // v7.0: Time-aware episodic greetings
          const greetings = [
            `${timeGreeting} L'ultima volta: "${episode.summary}". Continuiamo?`,
            `${timeGreeting} Riprendiamo: "${episode.summary}".`,
            `${timeGreeting} Ricordo: "${episode.summary}". Dove eravamo rimasti?`
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
            meta: { summary_length: episode.summary.length, time_aware: true }
          });
          
          console.log('[NORAH v7.0] Time-aware episodic greeting displayed:', greeting);
        } else {
          // v7.0: Time-aware initial greeting
          const greetingMsg: NorahMessage = {
            role: 'norah',
            content: `${timeGreeting} Come posso aiutarti?`,
            timestamp: Date.now()
          };
          addMessage(greetingMsg);
          setMessages([...getMessages()]);
        }
      } catch (error) {
        console.error('[Norah v7.0] Failed to load greeting:', error);
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

      // v7.0: Track sentiment and emotional context
      const sentiment = detectSentiment(userInput);
      trackEmotion(sentiment);
      const emotionalContext = getEmotionalContext();

      // Load/refresh context
      const ctx = await buildNorahContext();
      setContext(ctx);

      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      // Route intent (single arg signature)
      const intentResult = routeIntent(userInput);

      // v7.0: Get adaptive empathy prefix
      const empathyPrefix = getAdaptiveEmpathy(emotionalContext);

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
          reply = await generateReply(userInput);
      }

      // v7.0: Apply adaptive empathy if needed
      if (empathyPrefix && emotionalContext.emotionalTrend === 'declining') {
        reply = empathyPrefix + reply;
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

      // v7.0: Persist emotional context
      if (ctx?.agent?.code) {
        await persistEmotionalContext(ctx.agent.code, emotionalContext);
      }

      // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
      // v7.0: Enhanced telemetry with sentiment
      const elapsed = Date.now() - startTime;
      await logEvent({
        event: 'reply_generated',
        intent: intentResult.intent,
        sentiment,
        meta: { ms: elapsed, emotional_trend: emotionalContext.emotionalTrend }
      });

      return reply;

    } catch (error) {
      console.error('[Norah v7.0] Ask failed:', error);
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
