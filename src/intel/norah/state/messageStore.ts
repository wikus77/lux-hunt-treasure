// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Message Store - In-memory + Supabase persistence

import { supabase } from '@/integrations/supabase/client';

export interface NorahMessage {
  role: 'user' | 'norah';
  content: string;
  intent?: string;
  timestamp: number;
}

let messageBuffer: NorahMessage[] = [];
let persistTimeout: NodeJS.Timeout | null = null;

export function addMessage(msg: NorahMessage) {
  messageBuffer.push(msg);
  
  // Keep only last 20 in memory
  if (messageBuffer.length > 20) {
    messageBuffer = messageBuffer.slice(-20);
  }

  // Debounced persist
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persistToSupabase(msg);
  }, 1000);
}

export function getMessages(): NorahMessage[] {
  return [...messageBuffer];
}

export function clearMessages() {
  messageBuffer = [];
}

async function persistToSupabase(msg: NorahMessage) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('norah_messages').insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
      intent: msg.intent,
      context: {}
    });
  } catch (error) {
    console.error('[Norah] Failed to persist message:', error);
  }
}
