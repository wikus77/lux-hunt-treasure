
// Authentication verification utility

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export interface AuthVerificationResult {
  isValid: boolean;
  userId?: string;
  error?: string;
  statusCode?: number;
}

export const verifyAuthHeader = async (authHeader: string | null, supabaseUrl: string, supabaseServiceKey: string): Promise<AuthVerificationResult> => {
  // 1. AUTHENTICATION - Verify Authorization Header
  if (!authHeader) {
    console.error("Missing authorization header");
    return {
      isValid: false,
      error: "Token di autorizzazione mancante",
      statusCode: 401
    };
  }

  // Extract Bearer token
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.error("Invalid authorization format");
    return {
      isValid: false,
      error: "Formato token di autorizzazione non valido",
      statusCode: 401
    };
  }

  // Create authenticated Supabase client for token verification
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Verify token with Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error("Invalid token:", authError?.message);
    return {
      isValid: false,
      error: "Token di autorizzazione non valido",
      statusCode: 401
    };
  }

  return {
    isValid: true,
    userId: user.id
  };
};
