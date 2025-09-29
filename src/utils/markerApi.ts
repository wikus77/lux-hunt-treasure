// © 2025 Joseph MULÉ – M1SSION™
import { supabase } from '@/integrations/supabase/client';

export interface MarkerDistribution {
  type: 'Message' | 'Buzz Free' | 'XP Points';
  quantity: number;
  message?: string;
  visibility_hours?: number;
}

export interface BulkMarkerRequest {
  distributions: MarkerDistribution[];
  visibility_hours: number;
}

export interface BulkMarkerResponse {
  success: boolean;
  created?: number;
  details?: Array<{ type: string; quantity: number }>;
  timestamp?: string;
  error?: string;
  stage?: string;
}

export const createBulkMarkers = async (request: BulkMarkerRequest): Promise<BulkMarkerResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No session found');
  }

  const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

  const url = `${SUPABASE_URL}/functions/v1/bulk-marker-drop`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
      'Origin': window.location.origin
    },
    body: JSON.stringify(request)
  });

  const responseText = await response.text();
  
  let parsedResponse: any;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(parsedResponse?.error || `HTTP ${response.status}: ${responseText}`);
  }

  return parsedResponse;
};