// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI LLM Hook
// Connects /intelligence to AI Gateway with streaming and fallback

import { useState, useCallback } from 'react';
import { processAIRequest, type AIGatewayOptions } from '@/lib/ai-gateway/aiGateway';
import { useToast } from '@/hooks/use-toast';
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

    try {
      // Add user message to history
      const userMessage = { role: 'user', content: userInput };
      setConversationHistory(prev => [...prev, userMessage]);

      // Try LLM first
      const options: AIGatewayOptions = {
        userId,
        userMessage: userInput,
        route,
        locale,
        conversationHistory
      };

      const response = await processAIRequest(options);

      // Add AI response to history
      const aiMessage = { role: 'assistant', content: response.message };
      setConversationHistory(prev => [...prev, aiMessage]);

      setIsOffline(false);
      return response.message;

    } catch (error: any) {
      console.error(`[NorahLLM] traceId:${traceId} error:`, error);

      // Check for rate limit or payment errors
      if (error?.message?.includes('402') || error?.message?.includes('429')) {
        setIsOffline(true);
        toast({
          title: 'Limite raggiunto',
          description: 'Modalità offline attiva. Risposte limitate.',
          variant: 'destructive'
        });
      }

      // Fallback to local template-based response
      const fallbackReply = await generateReply(userInput);
      const aiMessage = { role: 'assistant', content: fallbackReply };
      setConversationHistory(prev => [...prev, aiMessage]);

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
