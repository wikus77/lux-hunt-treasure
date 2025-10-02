// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Function Calling System - Tool Execution Engine

import { supabase } from '@/integrations/supabase/client';
import { ToolCall, ToolResult } from '@/types/ai-gateway.types';

export async function executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
  const { name, arguments: argsJson } = toolCall.function;
  
  try {
    const args = JSON.parse(argsJson);
    let result: any;

    switch (name) {
      case 'get_user_state':
        result = await callEdgeFunction('get-user-state', args);
        break;
      
      case 'get_nearby_prizes':
        result = await callEdgeFunction('get-nearby-prizes', args);
        break;
      
      case 'retrieve_docs':
        result = await callEdgeFunction('rag-search', args);
        break;
      
      case 'open_support_ticket':
        result = await callEdgeFunction('open-support-ticket', args);
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      name,
      content: JSON.stringify(result)
    };
  } catch (error) {
    console.error(`[Tool Execution] ${name} failed:`, error);
    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      name,
      content: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
}

async function callEdgeFunction(functionName: string, args: any): Promise<any> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: args
  });

  if (error) throw error;
  return data;
}

export async function executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  return Promise.all(toolCalls.map(executeToolCall));
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
