// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AI Gateway - Main orchestrator for AI interactions with function calling

import { supabase } from '@/integrations/supabase/client';
import { buildEnhancedContext } from './contextBuilder';
import { buildSystemPrompt, buildDeveloperPrompt } from './promptBuilder';
import { executeToolCalls } from './functionCalling';
import { TOOL_SCHEMAS } from './toolSchemas';
import { AIResponse, EnhancedContext } from '@/types/ai-gateway.types';

export interface AIGatewayOptions {
  userId: string;
  userMessage: string;
  route?: string;
  geo?: { lat: number; lng: number };
  locale?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export async function processAIRequest(options: AIGatewayOptions): Promise<AIResponse> {
  const { userId, userMessage, conversationHistory = [] } = options;

  try {
    // 1. Build enhanced context
    const context = await buildEnhancedContext(userId, {
      route: options.route,
      geo: options.geo,
      locale: options.locale || 'it'
    });

    // 2. Build system prompt
    const systemPrompt = buildSystemPrompt(context);
    const developerPrompt = buildDeveloperPrompt();

    // 3. Prepare messages for LLM
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: developerPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // 4. Call LLM via Supabase Edge Function (Lovable AI Gateway)
    const { data: fxData, error: fxError } = await supabase.functions.invoke('chat', {
      body: { messages }
    });

    if (fxError) {
      console.error('[AI Gateway] chat function error:', fxError);
      return { message: 'Problema con il servizio AI. Riprova tra poco.', suggestedActions: [] };
    }

    const response: AIResponse = {
      message: fxData?.message || 'Nessuna risposta dal modello.',
    };

    // 5. Log interaction
    await logAIInteraction(userId, userMessage, response.message, context);

    return response;

  } catch (error) {
    console.error('[AI Gateway] Error:', error);
    return {
      message: 'Mi dispiace, ho avuto un problema tecnico. Riprova tra poco.',
      suggestedActions: []
    };
  }
}

async function logAIInteraction(
  userId: string,
  userMessage: string,
  aiResponse: string,
  context: EnhancedContext
): Promise<void> {
  try {
    // Create or get session
    const { data: session } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let sessionId = session?.id;

    if (!sessionId) {
      const { data: newSession } = await supabase
        .from('ai_sessions')
        .insert({
          user_id: userId,
          locale: context.locale,
          subscription_tier: context.tier
        })
        .select('id')
        .single();
      
      sessionId = newSession?.id;
    }

    // Log event
    if (sessionId) {
      await supabase.from('ai_events').insert({
        session_id: sessionId,
        user_id: userId,
        event_type: 'ai_response',
        payload: {
          user_message: userMessage.substring(0, 200),
          ai_response: aiResponse.substring(0, 200),
          context_tier: context.tier,
          context_clues: context.cluesFound
        }
      });
    }
  } catch (error) {
    console.error('[AI Gateway] Failed to log interaction:', error);
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
