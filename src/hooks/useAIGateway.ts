// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// React Hook for AI Gateway - Function calling enabled conversations

import { useState, useCallback } from 'react';
import { processAIRequest } from '@/lib/ai-gateway/aiGateway';
import { AIResponse } from '@/types/ai-gateway.types';
import { useToast } from '@/hooks/use-toast';

interface UseAIGatewayOptions {
  userId: string;
  route?: string;
  locale?: string;
}

export function useAIGateway({ userId, route, locale = 'it' }: UseAIGatewayOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message: string): Promise<AIResponse | null> => {
    if (!message.trim() || isProcessing) return null;

    setIsProcessing(true);

    try {
      // Add user message to history
      const userMessage = { role: 'user', content: message };
      setConversationHistory(prev => [...prev, userMessage]);

      // Process through AI Gateway
      const response = await processAIRequest({
        userId,
        userMessage: message,
        route,
        locale,
        conversationHistory
      });

      // Add AI response to history
      const aiMessage = { role: 'assistant', content: response.message };
      setConversationHistory(prev => [...prev, aiMessage]);

      return response;

    } catch (error) {
      console.error('[useAIGateway] Error:', error);
      toast({
        title: 'Errore di comunicazione',
        description: 'Riprova tra poco',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [userId, route, locale, conversationHistory, isProcessing, toast]);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    sendMessage,
    clearHistory,
    isProcessing,
    conversationHistory
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
