// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export interface PushPayload {
  title: string;
  body: string;
  image?: string | null;
  deepLink?: string | null;
  badge?: string | null;
}

export interface AdminBroadcastRequest {
  title: string;
  body: string;
  image?: string | null;
  deepLink?: string | null;
  badge?: string | null;
  testToken?: string | null;
}

export interface PushSendRequest {
  audience: 'all' | 'segment' | 'list';
  filters?: {
    segment?: 'winners' | 'active_24h' | 'ios' | 'android' | 'webpush';
    ids?: string[];
    emails?: string[];
  };
  payload: PushPayload;
}

export interface PushTestRequest {
  token: string;
  payload: PushPayload;
}

export interface PushResult {
  ok: boolean;
  sent?: number;
  failed?: number;
  error?: string;
  message?: string;
}