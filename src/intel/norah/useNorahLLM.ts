// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI LLM Hook v2
// Planner → RAG → Tools → Blueprint → LLM with fallback

import { useState, useCallback } from 'react';
import { processAIRequest, type AIGatewayOptions } from '@/lib/ai-gateway/aiGateway';
import { useToast } from '@/hooks/use-toast';
import { routeIntent, shouldClarify, getClarificationQuestion } from './engine/intentRouter';
import { formatAnswer, renderAnswer, type BlueprintInput } from './engine/answerBlueprint';
import { generateReply } from './engine/replyGenerator';

interface UseNorahLLMOptions {
  userId: string;
  route?: string;
  locale?: string;
}

export function useNorahLLM({ userId, route, locale = 'it' }: UseNorahLLMOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const askNorah = useCallback(async (userInput: string): Promise<string> => {
    if (!userInput.trim() || isProcessing) return '';

    setIsProcessing(true);
    const traceId = crypto.randomUUID();
    console.log(`[NorahLLM] traceId:${traceId} input: "${userInput.substring(0, 50)}..."`);

    try {
      // 1. PLANNER: Route intent
      const intentResult = routeIntent(userInput);
      console.log(`[NorahLLM] traceId:${traceId} intent:`, intentResult);

      // 2. CLARIFY if needed
      if (shouldClarify(intentResult)) {
        const clarification = getClarificationQuestion(userInput);
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userInput },
          { role: 'assistant', content: clarification }
        ]);
        setIsProcessing(false);
        return clarification;
      }

      // 3. Add user message to history
      const userMessage = { role: 'user', content: userInput };
      setConversationHistory(prev => [...prev, userMessage]);

      // 4. Try LLM with tools + RAG
      const options: AIGatewayOptions = {
        userId,
        userMessage: userInput,
        route,
        locale,
        conversationHistory
      };

      const response = await processAIRequest(options);

      // 5. Format with blueprint (if we have structured data)
      let finalMessage = response.message;
      
      // Note: Blueprint formatting is optional - LLM should follow system prompt
      // but we can enhance with structured CTAs if needed
      
      // 6. Add AI response to history
      const aiMessage = { role: 'assistant', content: finalMessage };
      setConversationHistory(prev => [...prev, aiMessage]);

      setIsOffline(false);
      console.log(`[NorahLLM] traceId:${traceId} success`);
      return finalMessage;

    } catch (error: any) {
      console.error(`[NorahLLM] traceId:${traceId} error:`, error);

      // Check for rate limit or payment errors
      const is402or429 = error?.message?.includes('402') || 
                        error?.message?.includes('429') ||
                        error?.status === 402 ||
                        error?.status === 429;

      if (is402or429) {
        setIsOffline(true);
        toast({
          title: '⚠️ Modalità Offline',
          description: 'Limite raggiunto. Risposte template attive.',
          variant: 'destructive'
        });
      }

      // Fallback to local template-based response
      console.log(`[NorahLLM] traceId:${traceId} falling back to local engine`);
      const fallbackReply = await generateReply(userInput);
      
      const aiMessage = { role: 'assistant', content: fallbackReply };
      setConversationHistory(prev => [
        { role: 'user', content: userInput },
        aiMessage
      ]);

      setIsOffline(true);
      return fallbackReply;

    } finally {
      setIsProcessing(false);
    }
  }, [userId, route, locale, conversationHistory, isProcessing, toast]);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setIsOffline(false);
  }, []);

  return {
    askNorah,
    clearHistory,
    isProcessing,
    conversationHistory,
    isOffline
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
