// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AI Gateway Types - Function Calling & Tool Schema

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  name: string;
  content: string;
}

export interface EnhancedContext {
  // User Identity
  userId: string;
  agentCode: string | null;
  tier: string;
  
  // Game State
  cluesFound: number;
  buzzCount: number;
  mapGenerated: boolean;
  
  // Location (if available)
  geo?: {
    lat: number;
    lng: number;
    city?: string;
  };
  
  // App State
  route?: string;
  device?: string;
  locale: string;
  
  // Recent Activity
  recentMessages: Array<{ role: string; content: string }>;
  recentFinalShots?: Array<{ createdAt: string; result: string }>;
  
  // Notifications
  unreadNotifications?: number;
}

export interface AIResponse {
  message: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
    payload?: any;
  }>;
  toolCalls?: ToolCall[];
}

export interface AISessionData {
  id: string;
  userId: string;
  startedAt: string;
  lastActiveAt: string;
  locale: string;
  device: string | null;
  subscriptionTier: string | null;
}

export interface AIEventPayload {
  sessionId?: string;
  eventType: 'tool_call' | 'error' | 'feedback' | 'click_cta' | 'rag_query';
  payload: Record<string, any>;
}

export interface RAGDocument {
  docId: string;
  title: string;
  chunkText: string;
  similarity: number;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
