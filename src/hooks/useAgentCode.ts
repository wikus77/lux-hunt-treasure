
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAgentCode, getAgentCodeForUser } from "@/services/agentCodeService";
import { getAdminCode } from "@/config/adminConfig";

// Cache key for localStorage
const AGENT_CODE_CACHE_KEY = 'm1ssion_agent_code';
const AGENT_CODE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAgentCode {
  code: string;
  timestamp: number;
  userId: string;
}

// Get cached agent code from localStorage (instant)
const getCachedAgentCode = (): CachedAgentCode | null => {
  try {
    const cached = localStorage.getItem(AGENT_CODE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as CachedAgentCode;
      // Check if cache is still valid (24 hours)
      if (Date.now() - parsed.timestamp < AGENT_CODE_CACHE_EXPIRY) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return null;
};

// Save agent code to localStorage
const setCachedAgentCode = (code: string, userId: string) => {
  try {
    const cached: CachedAgentCode = {
      code,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(AGENT_CODE_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
};

export const useAgentCode = () => {
  // Start with cached value for instant display
  const cached = getCachedAgentCode();
  const [agentCode, setAgentCode] = useState<string | null>(cached?.code || null);
  const [isLoading, setIsLoading] = useState(!cached?.code);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetch
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    const fetchAgentCode = async () => {
      try {
        // Don't show loading if we have cached code
        if (!cached?.code) {
          setIsLoading(true);
        }
        setError(null);

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // 🔴 ADMIN CHECK FIRST - always use config value, ignore cache
        const adminCode = getAdminCode(user.email);
        
        if (adminCode) {
          // 🔧 FIX: Force update if cached value differs from admin config
          if (cached?.code !== adminCode) {
            console.log('[useAgentCode] Admin code changed, updating cache:', adminCode);
          }
          setAgentCode(adminCode);
          setCachedAgentCode(adminCode, user.id);
          setIsLoading(false);
          return;
        }
        
        // Check if cached code belongs to current user
        if (cached?.code && cached?.userId === user.id) {
          // Already have the right code, just validate in background
          setAgentCode(cached.code);
          setIsLoading(false);
          
          // Validate in background (don't await)
          ensureAgentCode(user.id).then(freshCode => {
            if (freshCode && freshCode !== cached.code) {
              setAgentCode(freshCode);
              setCachedAgentCode(freshCode, user.id);
            }
          });
          return;
        }
        
        // For non-admin users, get or create the agent code
        const code = await ensureAgentCode(user.id);
        
        if (code) {
          setAgentCode(code);
          setCachedAgentCode(code, user.id);
        } else {
          setError(new Error("Failed to retrieve agent code"));
        }
      } catch (e) {
        console.error("Error fetching agent code:", e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentCode();
  }, []);

  return {
    agentCode,
    isLoading,
    error
  };
};

export default useAgentCode;
